"use strict";

/* =========================
   ELEMENTS
========================= */

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

const selectedFileBox =
    document.getElementById("selectedFile");

const imagePreview =
    document.getElementById("imagePreview");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const imageDimensions =
    document.getElementById("imageDimensions");

const targetSize =
    document.getElementById("targetSize");

const customTarget =
    document.getElementById("customTarget");

const customSize =
    document.getElementById("customSize");

const outputFormat =
    document.getElementById("outputFormat");

const compressButton =
    document.getElementById("compressButton");

const statusBox =
    document.getElementById("status");

const resultBox =
    document.getElementById("result");

const originalSizeText =
    document.getElementById("originalSize");

const compressedSizeText =
    document.getElementById("compressedSize");

const reductionText =
    document.getElementById("reduction");

const resultFormatText =
    document.getElementById("resultFormat");

const downloadButton =
    document.getElementById("downloadButton");


/* =========================
   VARIABLES
========================= */

let selectedFile = null;
let previewURL = null;
let downloadURL = null;


/* =========================
   FILE INPUT
========================= */

fileInput.addEventListener(
    "change",
    function (event) {

        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        selectImage(file);
    }
);


/* =========================
   UPLOAD AREA CLICK
========================= */

dropZone.addEventListener(
    "click",
    function (event) {

        /*
         * Don't trigger the input twice when
         * the user clicks the visible label.
         */

        if (
            event.target.tagName.toLowerCase() === "label" ||
            event.target.closest("label")
        ) {
            return;
        }

        fileInput.click();
    }
);


/* =========================
   KEYBOARD ACCESS
========================= */

dropZone.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            fileInput.click();
        }
    }
);


/* =========================
   DRAG & DROP
========================= */

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );
    }
);


dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "drag-over"
        );
    }
);


dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "drag-over"
        );

        const files =
            event.dataTransfer.files;

        if (!files || files.length === 0) {
            return;
        }

        selectImage(files[0]);
    }
);


/* =========================
   SELECT IMAGE
========================= */

function selectImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        showStatus(
            "Please choose a JPG, PNG or WebP image."
        );

        return;
    }


    /*
     * Very large files can consume a lot of
     * browser memory.
     */

    const maxInputSize =
        25 * 1024 * 1024;

    if (file.size > maxInputSize) {

        showStatus(
            "Please choose an image smaller than 25 MB."
        );

        return;
    }


    selectedFile = file;


    /*
     * Remove old preview URL.
     */

    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );
    }


    previewURL =
        URL.createObjectURL(file);


    imagePreview.src =
        previewURL;


    imagePreview.onload =
        function () {

            imageDimensions.textContent =
                `${imagePreview.naturalWidth} × ${imagePreview.naturalHeight}px`;
        };


    imagePreview.onerror =
        function () {

            showStatus(
                "Unable to preview this image."
            );
        };


    /*
     * File information
     */

    fileName.textContent =
        file.name;

    fileSize.textContent =
        formatBytes(file.size);


    /*
     * Show selected image area.
     */

    selectedFileBox.classList.add(
        "visible"
    );


    /*
     * Enable compressor.
     */

    compressButton.disabled = false;

    compressButton.textContent =
        "Compress Image";


    /*
     * Hide previous result.
     */

    resultBox.classList.remove(
        "visible"
    );


    /*
     * Reset old download.
     */

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

        downloadURL = null;
    }


    showStatus(
        "Image selected successfully. Choose your target size and compress."
    );
}


/* =========================
   TARGET SIZE
========================= */

targetSize.addEventListener(
    "change",
    function () {

        if (
            targetSize.value ===
            "custom"
        ) {

            customTarget.classList.add(
                "visible"
            );

        } else {

            customTarget.classList.remove(
                "visible"
            );
        }
    }
);


/* =========================
   CUSTOM SIZE VALIDATION
========================= */

customSize.addEventListener(
    "input",
    function () {

        if (
            Number(customSize.value) < 5
        ) {

            customSize.setCustomValidity(
                "Minimum target size is 5 KB."
            );

        } else {

            customSize.setCustomValidity(
                ""
            );
        }
    }
);


/* =========================
   COMPRESS BUTTON
========================= */

compressButton.addEventListener(
    "click",
    async function () {

        if (!selectedFile) {

            showStatus(
                "Please select an image first."
            );

            return;
        }


        const targetKB =
            getTargetSize();


        if (
            !targetKB ||
            targetKB < 5
        ) {

            showStatus(
                "Please enter a valid target size."
            );

            return;
        }


        const targetBytes =
            targetKB * 1024;


        compressButton.disabled =
            true;

        compressButton.textContent =
            "Compressing...";


        resultBox.classList.remove(
            "visible"
        );


        showStatus(
            "Processing your image..."
        );


        try {

            const result =
                await compressImage(
                    selectedFile,
                    targetBytes,
                    outputFormat.value
                );


            if (
                !result ||
                !result.blob
            ) {

                showStatus(
                    "Could not create a compressed image. Try a larger target size."
                );

                return;
            }


            displayResult(result);

        } catch (error) {

            console.error(
                "Compression error:",
                error
            );

            showStatus(
                "Something went wrong while compressing the image."
            );

        } finally {

            compressButton.disabled =
                false;

            compressButton.textContent =
                "Compress Image";
        }
    }
);


/* =========================
   GET TARGET SIZE
========================= */

function getTargetSize() {

    if (
        targetSize.value ===
        "custom"
    ) {

        const value =
            Number(customSize.value);

        return value;
    }


    return Number(
        targetSize.value
    );
}


/* =========================
   LOAD IMAGE
========================= */

function loadImage(file) {

    return new Promise(
        function (resolve, reject) {

            const img =
                new Image();

            const url =
                URL.createObjectURL(file);


            img.onload =
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                    resolve(img);
                };


            img.onerror =
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                    reject(
                        new Error(
                            "Image could not be loaded."
                        )
                    );
                };


            img.src = url;
        }
    );
               }

/* =========================
   COMPRESSION ENGINE
========================= */

async function compressImage(
    file,
    targetBytes,
    mimeType
) {

    const image =
        await loadImage(file);


    let width =
        image.naturalWidth;

    let height =
        image.naturalHeight;


    let bestBlob = null;


    /*
     * First try:
     * Keep original dimensions and
     * search for the best quality.
     */

    let lowQuality = 0.05;
    let highQuality = 0.95;


    for (
        let attempt = 0;
        attempt < 12;
        attempt++
    ) {

        const quality =
            (lowQuality + highQuality) / 2;


        const blob =
            await createBlob(
                image,
                width,
                height,
                mimeType,
                quality
            );


        if (!blob) {
            break;
        }


        if (
            blob.size <=
            targetBytes
        ) {

            bestBlob = blob;

            /*
             * We can try higher quality.
             */

            lowQuality =
                quality;

        } else {

            /*
             * Need more compression.
             */

            highQuality =
                quality;
        }
    }


    /*
     * If quality alone wasn't enough,
     * reduce image dimensions gradually.
     */

    if (
        !bestBlob ||
        bestBlob.size >
        targetBytes
    ) {

        let scale = 0.90;


        for (
            let resizeAttempt = 0;
            resizeAttempt < 14;
            resizeAttempt++
        ) {

            width =
                Math.max(
                    100,
                    Math.round(
                        image.naturalWidth *
                        scale
                    )
                );


            height =
                Math.max(
                    100,
                    Math.round(
                        image.naturalHeight *
                        scale
                    )
                );


            let low = 0.05;
            let high = 0.90;

            let resizedBest =
                null;


            for (
                let attempt = 0;
                attempt < 10;
                attempt++
            ) {

                const quality =
                    (low + high) / 2;


                const blob =
                    await createBlob(
                        image,
                        width,
                        height,
                        mimeType,
                        quality
                    );


                if (!blob) {
                    break;
                }


                if (
                    blob.size <=
                    targetBytes
                ) {

                    resizedBest =
                        blob;

                    low =
                        quality;

                } else {

                    high =
                        quality;
                }
            }


            if (
                resizedBest &&
                (
                    !bestBlob ||
                    resizedBest.size <
                    bestBlob.size
                )
            ) {

                bestBlob =
                    resizedBest;
            }


            if (
                bestBlob &&
                bestBlob.size <=
                targetBytes
            ) {

                break;
            }


            scale *= 0.82;
        }
    }


    return {
        blob: bestBlob,
        width: width,
        height: height
    };
}


/* =========================
   CREATE IMAGE BLOB
========================= */

function createBlob(
    image,
    width,
    height,
    mimeType,
    quality
) {

    return new Promise(
        function (resolve) {

            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                width;

            canvas.height =
                height;


            const context =
                canvas.getContext(
                    "2d"
                );


            if (!context) {

                resolve(null);

                return;
            }


            /*
             * JPG does not support transparency.
             * Use white background when converting.
             */

            if (
                mimeType ===
                "image/jpeg"
            ) {

                context.fillStyle =
                    "#ffffff";

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
                function (blob) {

                    resolve(blob);

                },
                mimeType,
                quality
            );
        }
    );
}


/* =========================
   DISPLAY RESULT
========================= */

function displayResult(result) {

    const blob =
        result.blob;


    if (!blob) {

        showStatus(
            "Compression failed. Please try again."
        );

        return;
    }


    const originalBytes =
        selectedFile.size;


    const compressedBytes =
        blob.size;


    let reduction = 0;


    if (
        originalBytes > 0
    ) {

        reduction =
            (
                (
                    originalBytes -
                    compressedBytes
                ) /
                originalBytes
            ) * 100;
    }


    /*
     * Never show negative reduction.
     */

    reduction =
        Math.max(
            0,
            reduction
        );


    originalSizeText.textContent =
        formatBytes(
            originalBytes
        );


    compressedSizeText.textContent =
        formatBytes(
            compressedBytes
        );


    reductionText.textContent =
        `${reduction.toFixed(1)}%`;


    resultFormatText.textContent =
        getFormatName(
            outputFormat.value
        );


    /*
     * Remove old download URL.
     */

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );
    }


    downloadURL =
        URL.createObjectURL(
            blob
        );


    const extension =
        getExtension(
            outputFormat.value
        );


    const originalName =
        selectedFile.name
            .replace(
                /\.[^/.]+$/,
                ""
            );


    downloadButton.href =
        downloadURL;


    downloadButton.download =
        `${originalName}-compressed.${extension}`;


    resultBox.classList.add(
        "visible"
    );


    /*
     * Tell user if the target was reached.
     */

    const targetKB =
        getTargetSize();


    if (
        compressedBytes <=
        targetKB * 1024
    ) {

        showStatus(
            `Done! Image compressed to ${formatBytes(compressedBytes)}.`
        );

    } else {

        showStatus(
            `Compression completed at ${formatBytes(compressedBytes)}. The requested target could not be reached without excessive quality loss.`
        );
    }
}


/* =========================
   FORMAT NAME
========================= */

function getFormatName(
    mimeType
) {

    if (
        mimeType ===
        "image/jpeg"
    ) {

        return "JPG";
    }


    if (
        mimeType ===
        "image/webp"
    ) {

        return "WebP";
    }


    if (
        mimeType ===
        "image/png"
    ) {

        return "PNG";
    }


    return "Image";
}


/* =========================
   FILE EXTENSION
========================= */

function getExtension(
    mimeType
) {

    if (
        mimeType ===
        "image/jpeg"
    ) {

        return "jpg";
    }


    if (
        mimeType ===
        "image/webp"
    ) {

        return "webp";
    }


    if (
        mimeType ===
        "image/png"
    ) {

        return "png";
    }


    return "img";
}


/* =========================
   FORMAT BYTES
========================= */

function formatBytes(
    bytes
) {

    if (
        bytes < 1024
    ) {

        return `${bytes} B`;
    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(2)} MB`;
}


/* =========================
   STATUS MESSAGE
========================= */

function showStatus(
    message
) {

    statusBox.textContent =
        message;

    statusBox.classList.add(
        "visible"
    );
}


/* =========================
   CLEANUP
========================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (previewURL) {

            URL.revokeObjectURL(
                previewURL
            );
        }


        if (downloadURL) {

            URL.revokeObjectURL(
                downloadURL
            );
        }
    }
);
