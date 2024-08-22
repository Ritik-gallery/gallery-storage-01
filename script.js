document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const files = document.getElementById('fileInput').files;

    if (files.length === 0) {
        alert('Please select some files to upload.');
        return;
    }

    for (const file of files) {
        await uploadFileToGitHub(file);
    }

    loadGallery();
});

async function uploadFileToGitHub(file) {
    const repo = 'Ritik-gallery/gallery-storage-01'; // Your repository
    const path = `images/${file.name}`; // Store images in an 'images' folder
    const branch = 'main'; // Your branch name

    const base64Content = await fileToBase64(file);

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer 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`, // Your GitHub token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Add ${file.name}`,
            content: base64Content,
            branch: branch
        })
    });

    if (!response.ok) {
        console.error(`Failed to upload ${file.name}`, await response.json());
    } else {
        console.log(`${file.name} uploaded successfully`);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function loadGallery() {
    const repo = 'Ritik-gallery/gallery-storage-01'; // Your repository
    const path = 'images'; // Folder where images are stored
    const branch = 'main'; // Your branch name

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
            'Authorization': `Bearer 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`, // Your GitHub token
        }
    });

    const files = await response.json();

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    files.forEach(file => {
        if (file.type === 'file' && file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const anchor = document.createElement('a');
            anchor.href = file.download_url;
            anchor.dataset.lightbox = 'gallery';
            anchor.dataset.title = file.name;

            const img = document.createElement('img');
            img.src = file.download_url;
            img.alt = file.name;

            anchor.appendChild(img);
            gallery.appendChild(anchor);

            // Set the data-filename attribute to the anchor tag for the delete functionality
            anchor.setAttribute('data-filename', file.name);
        }
    });
}

async function getFileSHA(repo, path, branch) {
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
            'Authorization': `Bearer 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`, // Your GitHub token
        }
    });

    if (!response.ok) {
        console.error(`Failed to fetch SHA for ${path}`, await response.json());
        return null;
    }

    const fileData = await response.json();
    return fileData.sha;
}

async function deleteFileFromGitHub(fileName) {
    const repo = 'Ritik-gallery/gallery-storage-01'; // Your repository
    const path = `images/${fileName}`; // Path to the file
    const branch = 'main'; // Your branch name

    const sha = await getFileSHA(repo, path, branch);
    if (!sha) {
        alert('Failed to retrieve file SHA. Cannot delete the file.');
        return;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer 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`, // Your GitHub token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Delete ${fileName}`,
            sha: sha,
            branch: branch
        })
    });

    if (!response.ok) {
        console.error(`Failed to delete ${fileName}`, await response.json());
    } else {
        console.log(`${fileName} deleted successfully`);
        loadGallery(); // Reload the gallery after deletion
    }
}

// Show delete button on image open
document.addEventListener('DOMContentLoaded', function() {
    // Listen for Lightbox events
    document.addEventListener('click', function(event) {
        if (event.target && event.target.matches('[data-lightbox]')) {
            // Show delete button
            const deleteButton = document.getElementById('deleteButton');
            const fileName = event.target.closest('a').getAttribute('data-filename');
            deleteButton.style.display = 'block';
            deleteButton.onclick = function() {
                deleteFileFromGitHub(fileName);
                lightbox.close();
            };
        }
    });

    // Hide delete button when clicking outside the image
    document.addEventListener('click', function(event) {
        if (!event.target.closest('[data-lightbox]')) {
            const deleteButton = document.getElementById('deleteButton');
            deleteButton.style.display = 'none';
        }
    });

    // Load the gallery on page load
    loadGallery();
});
