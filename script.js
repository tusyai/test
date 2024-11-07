let items = [
    { id: 1, name: "Cream Ruffle Top", image: "https://img101.savana.com/v1/goods-pic/587a226fa4764d0a8146ffc9109886b3_w1440_q90.webp", category: "upper_body" },
    { id: 2, name: "Halter Top", image: "https://img101.savana.com/v1/goods-pic/a422b2661acd431dafe7d1aa59fee000UR_w1440_q90.webp", category: "upper_body" },
    { id: 3, name: "Sheer Pullover T-shirt", image: "https://img101.savana.com/v1/goods-pic/de7c3198e196410184ebd30ee0582640UR_w1440_q90.webp", category: "upper_body" }
];

function generateFileName() {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[-:\.]/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}`;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const preview = document.getElementById('uploadPreview');
        const resultTitle = document.querySelector('.result-title');
        const resultImage = document.getElementById('resultImage');
        
        // Show preview, hide result
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        resultTitle.style.display = 'none';
        resultImage.style.display = 'none';
        
        window.uploadedFile = file;
    }
}

async function handleTryOn() {
    if (!window.uploadedFile) {
        alert('Please upload an image first');
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultTitle = document.querySelector('.result-title');
    const resultImage = document.getElementById('resultImage');
    
    loadingOverlay.style.display = 'flex';

    try {
        const formData = new FormData();
        formData.append('file', window.uploadedFile);
        formData.append('fileName', generateFileName());

        const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic cHJpdmF0ZV9aUm9oZmVUVThkV01YQ3cvWDF6cm9halVkNjA9Og=='
            },
            body: formData
        });

        const uploadData = await uploadResponse.json();
        
        if (uploadData.url) {
            const garmentImageUrl = document.getElementById('itemImage').src;
            const garmentName = document.getElementById('itemName').textContent;
            const selectedItem = items.find(item => item.image === garmentImageUrl);
            
            const tryOnResponse = await fetch(`https://8jgczg.buildship.run/virtual-tryon?Human%20image%20url=${encodeURIComponent(uploadData.url)}&Garment%20Image%20URL=${encodeURIComponent(garmentImageUrl)}&garment_info=${encodeURIComponent(garmentName)}&item_category=${encodeURIComponent(selectedItem.category)}`, {
                method: 'GET'
            });

            const textResponse = await tryOnResponse.text();
            
            if (textResponse.trim().startsWith('http')) {
                // Show both result title and image
                resultTitle.style.display = 'block';
                resultImage.src = textResponse.trim();
                resultImage.style.display = 'block';
            } else {
                alert('Virtual try-on processing failed. Please try again.');
                console.error('Invalid response:', textResponse);
            }
        }
    } catch (error) {
        alert('Error processing virtual try-on. Please try again.');
        console.error('Try-on error:', error);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function initializeApp() {
    renderItems();
    // Add event listener for the try-on button
    document.getElementById('tryOnBtn').addEventListener('click', handleTryOn);
}

function renderItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
    `;
    card.onclick = () => showItemPage(item);
    return card;
}

function showItemPage(item) {
    document.getElementById('itemsGrid').style.display = 'none';
    document.getElementById('itemPage').style.display = 'block';
    document.getElementById('itemImage').src = item.image;
    document.getElementById('itemName').textContent = item.name;
    document.querySelector('.add-item-section').style.display = 'none';
}

function showMainPage() {
    document.getElementById('itemsGrid').style.display = 'grid';
    document.getElementById('itemPage').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('resultImage').style.display = 'none';
    document.querySelector('.result-title').style.display = 'none';
    
    // Clear the file input
    document.getElementById('fileUpload').value = '';
    window.uploadedFile = null;
}

document.addEventListener('DOMContentLoaded', initializeApp);