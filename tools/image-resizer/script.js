const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");

const editor = document.getElementById("editor");

const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");

const percentageInput = document.getElementById("percentageInput");

const lockRatio = document.getElementById("lockRatio");

const formatInput = document.getElementById("formatInput");

const qualityInput = document.getElementById("qualityInput");
const qualityValue = document.getElementById("qualityValue");

const previewImage = document.getElementById("previewImage");

const resizeButton = document.getElementById("resizeButton");
const resetButton = document.getElementById("resetButton");

const originalInfo = document.getElementById("originalInfo");
const fileInfo = document.getElementById("fileInfo");

const status = document.getElementById("status");

let originalImage = null;
let originalFile = null;

let originalWidth = 0;
let originalHeight = 0;

let aspectRatio = 1;

let currentObjectURL = null;


/* -----------------------------
   File Selection
----------------------------- */

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    loadImage(file);
});


/* -----------------------------
   Drag & Drop
----------------------------- */

uploadArea.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadArea.classList.add("dragover");
});


uploadArea.addEventListener("dragleave", function () {

    uploadArea.classList.remove("dragover");
});


uploadArea.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadArea.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        status.textContent = "Please select a valid image file.";
        return;
    }

    loadImage(file);
});


/* -----------------------------
   Load Image
----------------------------- */

function loadImage(file) {

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {

        status.textContent =
            "Please choose a JPG, PNG or WebP image.";

        return;
    }

    originalFile = file;

    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
    }

    currentObjectURL = URL.createObjectURL(file);

    const image = new Image();

    image.onload = function () {

        originalImage = image;

        originalWidth = image.naturalWidth;
        originalHeight = image.naturalHeight;

        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        originalInfo.textContent =
            `Original: ${originalWidth} × ${originalHeight}px`;

        fileInfo.textContent =
            `${file.name} • ${formatFileSize(file.size)}`;

        previewImage.src = currentObjectURL;

        editor.classList.add("visible");

        status.textContent =
            "Image loaded. Set your desired dimensions.";

    };

    image.onerror = function () {

        status.textContent =
            "Could not read this image.";

    };

    image.src = currentObjectURL;
}


/* -----------------------------
   Width Change
----------------------------- */

widthInput.addEventListener("input", function () {

    if (!lockRatio.checked) {
        return;
    }

    const width = Number(this.value);

    if (!width) {
        return;
    }

    const height = Math.round(width / aspectRatio);

    heightInput.value = height;

    percentageInput.value = "custom";
});


/* -----------------------------
   Height Change
----------------------------- */

heightInput.addEventListener("input", function () {

    if (!lockRatio.checked) {
        return;
    }

    const height = Number(this.value);

    if (!height) {
        return;
    }

    const width = Math.round(height * aspectRatio);

    widthInput.value = width;

    percentageInput.value = "custom";
});


/* -----------------------------
   Percentage Resize
----------------------------- */

percentageInput.addEventListener("change", function () {

    const value = this.value;

    if (value === "custom") {
        return;
    }

    const percentage = Number(value);

    const newWidth =
        Math.round(originalWidth * percentage / 100);

    const newHeight =
        Math.round(originalHeight * percentage / 100);

    widthInput.value = newWidth;
    heightInput.value = newHeight;
});


/* -----------------------------
   Quality Slider
----------------------------- */

qualityInput.addEventListener("input", function () {

    qualityValue.textContent = this.value;
});


/* -----------------------------
   Resize
----------------------------- */

resizeButton.addEventListener("click", function () {

    if (!originalImage) {
        status.textContent =
            "Please choose an image first.";
        return;
    }

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (
        !width ||
        !height ||
        width < 1 ||
        height < 1
    ) {

        status.textContent =
            "Please enter valid dimensions.";

        return;
    }

    if (width > 10000 || height > 10000) {

        status.textContent =
            "Maximum dimension is 10,000 pixels.";

        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    /*
        White background is used for JPG because
        JPG does not support transparency.
    */

    const format = formatInput.value;

    if (format === "image/jpeg") {

        context.fillStyle = "#ffffff";

        context.fillRect(
            0,
            0,
            width,
            height
        );
    }

    context.imageSmoothingEnabled = true;

    context.imageSmoothingQuality = "high";

    context.drawImage(
        originalImage,
        0,
        0,
        width,
        height
    );

    const quality =
        Number(qualityInput.value) / 100;

    canvas.toBlob(
        function (blob) {

            if (!blob) {

                status.textContent =
                    "Could not create the resized image.";

                return;
            }

            downloadBlob(
                blob,
                width,
                height,
                format
            );

            previewImage.src =
                URL.createObjectURL(blob);

            status.textContent =
                `Done — ${width} × ${height}px image created.`;

        },
        format,
        quality
    );
});


/* -----------------------------
   Download
----------------------------- */

function downloadBlob(
    blob,
    width,
    height,
    format
) {

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    let extension = "jpg";

    if (format === "image/png") {
        extension = "png";
    }

    if (format === "image/webp") {
        extension = "webp";
    }

    link.href = url;

    link.download =
        `toolton-resized-${width}x${height}.${extension}`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(function () {

        URL.revokeObjectURL(url);

    }, 1000);
}


/* -----------------------------
   Reset
----------------------------- */

resetButton.addEventListener("click", function () {

    fileInput.value = "";

    editor.classList.remove("visible");

    originalImage = null;
    originalFile = null;

    widthInput.value = "";
    heightInput.value = "";

    previewImage.removeAttribute("src");

    originalInfo.textContent =
        "Original: —";

    fileInfo.textContent =
        "—";

    status.textContent = "";

    percentageInput.value =
        "custom";
});


/* -----------------------------
   File Size
----------------------------- */

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
