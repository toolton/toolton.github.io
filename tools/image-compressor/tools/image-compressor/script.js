const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const compressButton = document.getElementById("compressButton");

const targetSize = document.getElementById("targetSize");
const customTarget = document.getElementById("customTarget");
const customSize = document.getElementById("customSize");
const outputFormat = document.getElementById("outputFormat");

const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

const originalSizeText = document.getElementById("originalSize");
const compressedSizeText = document.getElementById("compressedSize");
const reductionText = document.getElementById("reduction");
const resultFormatText = document.getElementById("resultFormat");
const downloadButton = document.getElementById("downloadButton");

let selectedFile = null;
let downloadUrl = null;


/* =========================
   FILE SELECTION
========================= */

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
        handleFile(file);
    }
});


dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});


dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});


dropZone.addEventListener("drop", (event) => {
    event.preventDefault();

    dropZone.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (file) {
        handleFile(file);
    }
});


function handleFile(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        showStatus(
            "Please select a JPG, PNG or WebP image."
        );

        return;
    }

    selectedFile = file;

    compressButton.disabled = false;

    resultBox.classList.remove("visible");

    showStatus(
        `Selected: ${file.name} (${formatBytes(file.size)})`
    );
}


/* =========================
   TARGET SIZE
========================= */

targetSize.addEventListener("change", () => {

    if (targetSize.value === "custom") {

        customTarget.classList.add("visible");

    } else {

        customTarget.classList.remove("visible");
    }
});


/* =========================
   COMPRESS
========================= */

compressButton.addEventListener("click", async () => {

    if (!selectedFile) {
        showStatus("Please select an image first.");
        return;
    }

    const targetKB = getTargetSize();

    if (!targetKB || targetKB < 5) {
        showStatus(
            "Please enter a valid target size of at least 5 KB."
        );

        return;
    }

    const targetBytes = targetKB * 1024;

    compressButton.disabled = true;

    showStatus("Processing your image...");

    resultBox.classList.remove("visible");

    try {

        const result = await compressImage(
            selectedFile,
            targetBytes,
            outputFormat.value
        );

        if (!result) {

            showStatus(
                "Could not compress this image. Try a larger target size or another format."
            );

            compressButton.disabled = false;

            return;
        }

        displayResult(result);

    } catch (error) {

        console.error(error);

        showStatus(
            "Something went wrong while processing the image."
        );

    } finally {

        compressButton.disabled = false;
    }
});


/* =========================
   TARGET SIZE
========================= */

function getTargetSize() {

    if (targetSize.value === "custom") {

        const value = Number(customSize.value);

        return value;
    }

    return Number(targetSize.value);
}


/* =========================
   IMAGE COMPRESSION ENGINE
========================= */

async function compressImage(
    file,
    targetBytes,
    mimeType
) {

    const image = await loadImage(file);

    /*
     * First attempt:
     * Keep original dimensions and reduce quality.
     */

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    let bestBlob = null;

    /*
     * Quality search.
     */

    let low = 0.05;
    let high = 0.95;

    for (let i = 0; i < 12; i++) {

        const quality = (low + high) / 2;

        const blob = await canvasToBlob(
            image,
            width,
            height,
            mimeType,
            quality
        );

        if (!blob) {
            break;
        }

        if (blob.size <= targetBytes) {

            bestBlob = blob;

            /*
             * Try higher quality.
             */

            low = quality;

        } else {

            /*
             * Need stronger compression.
             */

            high = quality;
        }
    }


    /*
     * If quality compression wasn't enough,
     * gradually reduce dimensions.
     */

    if (!bestBlob || bestBlob.size > targetBytes) {

        let scale = 0.9;

        for (let attempt = 0; attempt < 12; attempt++) {

            width = Math.max(
                100,
                Math.round(image.naturalWidth * scale)
            );

            height = Math.max(
                100,
                Math.round(image.naturalHeight * scale)
            );

            let lowQuality = 0.05;
            let highQuality = 0.9;

            let scaledBest = null;

            for (let i = 0; i < 10; i++) {

                const quality =
                    (lowQuality + highQuality) / 2;

                const blob = await canvasToBlob(
                    image,
                    width,
                    height,
                    mimeType,
                    quality
                );

                if (!blob) {
                    break;
                }

                if (blob.size <= targetBytes) {

                    scaledBest = blob;

                    lowQuality = quality;

                } else {

                    highQuality = quality;
                }
            }

            if (
                scaledBest &&
                (
                    !bestBlob ||
                    scaledBest.size < bestBlob.size
                )
            ) {

                bestBlob = scaledBest;
            }

            if (
                bestBlob &&
                bestBlob.size <= targetBytes
            ) {
                break;
            }

            scale *= 0.82;
        }
    }


    /*
     * If we still couldn't reach the target,
     * return the smallest result we found.
     */

    return {
        blob: bestBlob,
        width,
        height
    };
}


/* =========================
   CANVAS
========================= */

function canvasToBlob(
    image,
    width,
    height,
    mimeType,
    quality
) {

    return new Promise((resolve) => {

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
            resolve(null);
            return;
        }

        /*
         * White background prevents transparent PNG
         * areas becoming black when converting to JPG.
         */

        if (mimeType === "image/jpeg") {

            context.fillStyle = "#ffffff";

            context.fillRect(
                0,
                0,
                width,
                height
            );
        }

        context.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        canvas.toBlob(
            (blob) => {
                resolve(blob);
            },
            mimeType,
            quality
        );
    });
}


/* =========================
   LOAD IMAGE
========================= */

function loadImage(file) {

    return new Promise((resolve, reject) => {

        const image = new Image();

        const url = URL.createObjectURL(file);

        image.onload = () => {

            URL.revokeObjectURL(url);

            resolve(image);
        };

        image.onerror = () => {

            URL.revokeObjectURL(url);

            reject(
                new Error("Unable to load image.")
            );
        };

        image.src = url;
    });
}


/* =========================
   DISPLAY RESULT
========================= */

function displayResult(result) {

    if (!result || !result.blob) {

        showStatus(
            "The selected target size could not be reached."
        );

        return;
    }

    const originalBytes = selectedFile.size;
    const compressedBytes = result.blob.size;

    const reduction = Math.max(
        0,
        ((originalBytes - compressedBytes) /
            originalBytes) *
            100
    );

    originalSizeText.textContent =
        formatBytes(originalBytes);

    compressedSizeText.textContent =
        formatBytes(compressedBytes);

    reductionText.textContent =
        `${reduction.toFixed(1)}%`;

    resultFormatText.textContent =
        getFormatName(outputFormat.value);


    if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
    }

    downloadUrl = URL.createObjectURL(
        result.blob
    );

    const extension =
        getExtension(outputFormat.value);

    const originalName =
        selectedFile.name
            .replace(/\.[^/.]+$/, "");

    downloadButton.href =
        downloadUrl;

    downloadButton.download =
        `${originalName}-compressed.${extension}`;


    resultBox.classList.add("visible");

    showStatus(
        "Compression complete."
    );
}


/* =========================
   HELPERS
========================= */

function formatBytes(bytes) {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}


function getFormatName(mimeType) {

    if (mimeType === "image/jpeg") {
        return "JPG";
    }

    if (mimeType === "image/webp") {
        return "WebP";
    }

    if (mimeType === "image/png") {
        return "PNG";
    }

    return mimeType;
}


function getExtension(mimeType) {

    if (mimeType === "image/jpeg") {
        return "jpg";
    }

    if (mimeType === "image/webp") {
        return "webp";
    }

    if (mimeType === "image/png") {
        return "png";
    }

    return "img";
}


function showStatus(message) {

    statusBox.textContent = message;

    statusBox.classList.add("visible");
                  }
