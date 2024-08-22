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
    const repo = 'Ritik-gallery/gallery-storage-01'; // Replace with your repository name
    const path = `images/${file.name}`; // Store images in an 'images' folder
    const branch = 'main'; // Replace with your branch name

    const base64Content = await fileToBase64(file);

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer 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`, // Replace with your GitHub token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Add ${file.name}`,
            content: base64Content,
            branch: branch
        })
    });

    if (response.ok) {
        console.log(`${file.name} uploaded successfully`);
    } else {
        console.error(`Failed to upload ${file.name}`, await response.json());
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function loadGallery() {
    const repo = 'Ritik-gallery/gallery-storage-01'; // Replace with your repository name
    const path = 'images'; // Folder where images are stored
    const branch = 'main'; // Replace with your branch name

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
            'Authorization': `Bearer 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`, // Replace with your GitHub token
        }
    });

    const files = await response.json();

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    files.forEach(file => {
        if (file.type === 'file' && file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const img = document.createElement('img');
            img.src = file.download_url;
            img.alt = file.name;

            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            galleryItem.appendChild(img);

            const downloadBtn = document.createElement('button');
            downloadBtn.classList.add('download-btn');
            downloadBtn.textContent = 'Download';
            downloadBtn.addEventListener('click', () => {
                window.open(file.download_url);
            });

            galleryItem.appendChild(downloadBtn);
            gallery.appendChild(galleryItem);
        }
    });
}

// Load the gallery on page load
window.onload = loadGallery;