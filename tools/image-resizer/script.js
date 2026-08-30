/* =========================================
   TOOLTON IMAGE RESIZER
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ====================================== */

    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");
    const editor = document.getElementById("editor");

    const originalInfo = document.getElementById("originalInfo");
    const fileInfo = document.getElementById("fileInfo");

    const presetInput = document.getElementById("presetInput");

    const widthInput = document.getElementById("widthInput");
    const heightInput = document.getElementById("heightInput");

    const lockRatio = document.getElementById("lockRatio");

    const unitInput = document.getElementById("unitInput");
    const dpiInput = document.getElementById("dpiInput");

    const percentageInput =
        document.getElementById("percentageInput");

    const formatInput =
        document.getElementById("formatInput");

    const qualityInput =
        document.getElementById("qualityInput");

    const qualityValue =
        document.getElementById("qualityValue");

    const targetSizeInput =
        document.getElementById("targetSizeInput");

    const targetUnitInput =
        document.getElementById("targetUnitInput");

    const previewImage =
        document.getElementById("previewImage");

    const previewPlaceholder =
        document.getElementById("previewPlaceholder");

    const dimensionInfo =
        document.getElementById("dimensionInfo");

    const sizeInfo =
        document.getElementById("sizeInfo");

    const resizeButton =
        document.getElementById("resizeButton");

    const resetButton =
        document.getElementById("resetButton");

    const status =
        document.getElementById("status");


    /* =====================================
       VARIABLES
    ====================================== */

    let originalImage = null;
    let originalFile = null;

    let originalWidth = 0;
    let originalHeight = 0;

    let aspectRatio = 1;

    let previewURL = null;


    /* =====================================
       HELPER FUNCTIONS
    ====================================== */

    function formatBytes(bytes) {

        if (!bytes || bytes <= 0) {
            return "0 B";
        }

        const units = [
            "B",
            "KB",
            "MB",
            "GB"
        ];

        const i = Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

        return (
            bytes /
            Math.pow(1024, i)
        ).toFixed(i === 0 ? 0 : 2)
        + " "
        + units[i];
    }


    function setStatus(message) {

        if (status) {
            status.textContent = message;
        }

    }


    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }


    /* =====================================
       FILE UPLOAD
    ====================================== */

    function loadImage(file) {

        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            setStatus(
                "Please select a valid image file."
            );

            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            setStatus(
                "Please use JPG, PNG or WebP."
            );

            return;
        }


        originalFile = file;


        const reader = new FileReader();


        reader.onload = function(event) {

            const img = new Image();


            img.onload = function() {

                originalImage = img;

                originalWidth = img.naturalWidth;
                originalHeight = img.naturalHeight;

                aspectRatio =
                    originalWidth /
                    originalHeight;


                widthInput.value =
                    originalWidth;

                heightInput.value =
                    originalHeight;


                originalInfo.textContent =
                    "Original: "
                    + originalWidth
                    + " × "
                    + originalHeight
                    + " px";


                fileInfo.textContent =
                    "File size: "
                    + formatBytes(file.size);


                editor.classList.add("active");

                resizeButton.disabled = false;


                updatePreview();


                setStatus(
                    "Image loaded successfully."
                );

            };


            img.src = event.target.result;

        };


        reader.readAsDataURL(file);

    }


    fileInput.addEventListener(
        "change",
        function() {

            const file = this.files[0];

            loadImage(file);

        }
    );


    /* =====================================
       DRAG & DROP
    ====================================== */

    uploadArea.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragover"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function() {

            uploadArea.classList.remove(
                "dragover"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function(event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragover"
            );


            const file =
                event.dataTransfer.files[0];

            loadImage(file);

        }
    );


    /* =====================================
       UNIT CONVERSION
    ====================================== */

    function pixelsToUnit(
        pixels,
        unit,
        dpi
    ) {

        if (unit === "px") {
            return pixels;
        }


        if (unit === "in") {
            return pixels / dpi;
        }


        if (unit === "cm") {
            return (
                pixels / dpi
            ) * 2.54;
        }


        return pixels;

    }


    function unitToPixels(
        value,
        unit,
        dpi
    ) {

        if (unit === "px") {
            return value;
        }


        if (unit === "in") {
            return value * dpi;
        }


        if (unit === "cm") {
            return (
                value / 2.54
            ) * dpi;
        }


        return value;

    }


    function displayDimensions() {

        if (!originalImage) {
            return;
        }


        const unit =
            unitInput.value;

        const dpi =
            Math.max(
                1,
                Number(dpiInput.value) || 300
            );


        const width =
            Number(widthInput.value) || 0;

        const height =
            Number(heightInput.value) || 0;


        if (unit === "px") {

            widthInput.value =
                Math.round(width);

            heightInput.value =
                Math.round(height);

            return;
        }


        widthInput.value =
            pixelsToUnit(
                width,
                unit,
                dpi
            ).toFixed(2);


        heightInput.value =
            pixelsToUnit(
                height,
                unit,
                dpi
            ).toFixed(2);

    }


    function convertInputsToPixels() {

        const unit =
            unitInput.value;

        const dpi =
            Math.max(
                1,
                Number(dpiInput.value) || 300
            );


        let width =
            Number(widthInput.value);


        let height =
            Number(heightInput.value);


        if (!width || !height) {
            return null;
        }


        width =
            unitToPixels(
                width,
                unit,
                dpi
            );


        height =
            unitToPixels(
                height,
                unit,
                dpi
            );


        return {

            width: Math.max(
                1,
                Math.round(width)
            ),

            height: Math.max(
                1,
                Math.round(height)
            )

        };

    }


    /* =====================================
       UNIT CHANGE
    ====================================== */

    unitInput.addEventListener(
        "change",
        function() {

            if (!originalImage) {
                return;
            }


            const pixels =
                convertInputsToPixels();


            if (!pixels) {
                return;
            }


            const oldUnit =
                unitInput.dataset.previousUnit
                || "px";


            if (oldUnit === "px") {

                widthInput.value =
                    pixels.width;

                heightInput.value =
                    pixels.height;

            }


            unitInput.dataset.previousUnit =
                unitInput.value;


            displayDimensions();

            updatePreview();

        }
    );


    unitInput.dataset.previousUnit =
        "px";


    /* =====================================
       DPI CHANGE
    ====================================== */

    dpiInput.addEventListener(
        "change",
        function() {

            if (!originalImage) {
                return;
            }


            if (unitInput.value !== "px") {

                const pixels =
                    convertInputsToPixels();


                if (pixels) {

                    widthInput.value =
                        pixels.width;

                    heightInput.value =
                        pixels.height;

                    displayDimensions();

                }

            }

        }
    );


    /* =====================================
       ASPECT RATIO
    ====================================== */

    widthInput.addEventListener(
        "input",
        function() {

            if (
                !lockRatio.checked ||
                !originalImage
            ) {
                updatePreview();
                return;
            }


            const width =
                Number(widthInput.value);


            if (!width) {
                return;
            }


            const unit =
                unitInput.value;

            const dpi =
                Math.max(
                    1,
                    Number(dpiInput.value) || 300
                );


            const widthPx =
                unitToPixels(
                    width,
                    unit,
                    dpi
                );


            const heightPx =
                widthPx /
                aspectRatio;


            heightInput.value =
                unit === "px"
                    ? Math.round(heightPx)
                    : pixelsToUnit(
                        heightPx,
                        unit,
                        dpi
                    ).toFixed(2);


            updatePreview();

        }
    );


    heightInput.addEventListener(
        "input",
        function() {

            if (
                !lockRatio.checked ||
                !originalImage
            ) {
                updatePreview();
                return;
            }


            const height =
                Number(heightInput.value);


            if (!height) {
                return;
            }


            const unit =
                unitInput.value;

            const dpi =
                Math.max(
                    1,
                    Number(dpiInput.value) || 300
                );


            const heightPx =
                unitToPixels(
                    height,
                    unit,
                    dpi
                );


            const widthPx =
                heightPx *
                aspectRatio;


            widthInput.value =
                unit === "px"
                    ? Math.round(widthPx)
                    : pixelsToUnit(
                        widthPx,
                        unit,
                        dpi
                    ).toFixed(2);


            updatePreview();

        }
    );


    /* =====================================
       PRESETS
    ====================================== */

    const presets = {

        passport35x45: {
            width: 35,
            height: 45,
            unit: "cm",
            factor: 0.1
        },

        passport2x2: {
            width: 2,
            height: 2,
            unit: "in"
        },

        signature: {
            width: 4,
            height: 2,
            unit: "cm"
        },

        square: {
            width: 1,
            height: 1,
            unit: "in"
        },

        a4: {
            width: 21,
            height: 29.7,
            unit: "cm"
        }

    };


    presetInput.addEventListener(
        "change",
        function() {

            const preset =
                presets[this.value];


            if (!preset) {
                return;
            }


            unitInput.value =
                preset.unit;


            unitInput.dataset.previousUnit =
                preset.unit;


            dpiInput.value =
                300;


            widthInput.value =
                preset.width;

            heightInput.value =
                preset.height;


            lockRatio.checked =
                false;


            updatePreview();

        }
    );


    /* =====================================
       PERCENTAGE RESIZE
    ====================================== */

    percentageInput.addEventListener(
        "change",
        function() {

            if (
                !originalImage ||
                this.value === "custom"
            ) {
                return;
            }


            const percentage =
                Number(this.value);


            if (!percentage) {
                return;
            }


            unitInput.value =
                "px";


            unitInput.dataset.previousUnit =
                "px";


            widthInput.value =
                Math.max(
                    1,
                    Math.round(
                        originalWidth *
                        percentage /
                        100
                    )
                );


            heightInput.value =
                Math.max(
                    1,
                    Math.round(
                        originalHeight *
                        percentage /
                        100
                    )
                );


            lockRatio.checked =
                true;


            updatePreview();

        }
    );


    /* =====================================
       QUALITY
    ====================================== */

    qualityInput.addEventListener(
        "input",
        function() {

            qualityValue.textContent =
                this.value;

        }
    );


    /* =====================================
       CANVAS CREATION
    ====================================== */

    function createCanvas(
        width,
        height
    ) {

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            width;

        canvas.height =
            height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.imageSmoothingEnabled =
            true;

        ctx.imageSmoothingQuality =
            "high";


        return {
            canvas,
            ctx
        };

    }


    /* =====================================
       PREVIEW
    ====================================== */

    function updatePreview() {

        if (!originalImage) {
            return;
        }


        const pixels =
            convertInputsToPixels();


        if (!pixels) {
            return;
        }


        const width =
            pixels.width;

        const height =
            pixels.height;


        const result =
            createCanvas(
                width,
                height
            );


        result.ctx.drawImage(
            originalImage,
            0,
            0,
            width,
            height
        );


        const mime =
            formatInput.value;


        const quality =
            Number(
                qualityInput.value
            ) / 100;


        result.canvas.toBlob(
            function(blob) {

                if (!blob) {
                    return;
                }


                if (previewURL) {

                    URL.revokeObjectURL(
                        previewURL
                    );

                }


                previewURL =
                    URL.createObjectURL(
                        blob
                    );


                previewImage.src =
                    previewURL;


                previewImage.style.display =
                    "block";


                previewPlaceholder.style.display =
                    "none";


                dimensionInfo.textContent =
                    "Output: "
                    + width
                    + " × "
                    + height
                    + " px";


                sizeInfo.textContent =
                    "File size: "
                    + formatBytes(
                        blob.size
                    );

            },
            mime,
            quality
        );

    }


    widthInput.addEventListener(
        "input",
        updatePreview
    );

    heightInput.addEventListener(
        "input",
        updatePreview
    );

    formatInput.addEventListener(
        "change",
        updatePreview
    );

    qualityInput.addEventListener(
        "change",
        updatePreview
    );


    /* =====================================
       TARGET FILE SIZE
    ====================================== */

    function targetBytes() {

        const value =
            Number(
                targetSizeInput.value
            );


        if (!value || value <= 0) {
            return null;
        }


        if (
            targetUnitInput.value ===
            "MB"
        ) {

            return value *
                   1024 *
                   1024;

        }


        return value * 1024;

    }


    async function canvasToBlob(
        canvas,
        mime,
        quality
    ) {

        return new Promise(
            resolve => {

                canvas.toBlob(
                    blob => resolve(blob),
                    mime,
                    quality
                );

            }
        );

    }


    async function compressToTarget(
        canvas,
        mime,
        target
    ) {

        let low = 0.05;
        let high = 1;

        let bestBlob = null;


        for (
            let i = 0;
            i < 10;
            i++
        ) {

            const quality =
                (low + high) / 2;


            const blob =
                await canvasToBlob(
                    canvas,
                    mime,
                    quality
                );


            if (!blob) {
                break;
            }


            if (
                blob.size <= target
            ) {

                bestBlob =
                    blob;

                low =
                    quality;

            } else {

                high =
                    quality;

            }

        }


        if (!bestBlob) {

            bestBlob =
                await canvasToBlob(
                    canvas,
                    mime,
                    0.05
                );

        }


        return bestBlob;

    }


       /* =====================================
       RESIZE + DOWNLOAD
    ====================================== */

    resizeButton.addEventListener(
        "click",
        async function () {

            if (!originalImage) {

                setStatus(
                    "Please choose an image first."
                );

                return;
            }


            const pixels =
                convertInputsToPixels();


            if (!pixels) {

                setStatus(
                    "Please enter valid dimensions."
                );

                return;
            }


            const width =
                clamp(
                    pixels.width,
                    1,
                    10000
                );


            const height =
                clamp(
                    pixels.height,
                    1,
                    10000
                );


            const result =
                createCanvas(
                    width,
                    height
                );


            result.ctx.drawImage(
                originalImage,
                0,
                0,
                width,
                height
            );


            const mime =
                formatInput.value;


            const quality =
                Number(
                    qualityInput.value
                ) / 100;


            const target =
                targetBytes();


            resizeButton.disabled =
                true;


            setStatus(
                "Processing image..."
            );


            try {

                let blob;


                /*
                 * Target file size
                 * JPG + WebP
                 */

                if (
                    target &&
                    (
                        mime === "image/jpeg" ||
                        mime === "image/webp"
                    )
                ) {

                    blob =
                        await compressToTarget(
                            result.canvas,
                            mime,
                            target
                        );

                }

                else {

                    blob =
                        await canvasToBlob(
                            result.canvas,
                            mime,
                            quality
                        );

                }


                if (!blob) {

                    throw new Error(
                        "Unable to create image."
                    );

                }


                /* =========================
                   FILE EXTENSION
                ========================== */

                let extension = "jpg";


                if (
                    mime === "image/png"
                ) {

                    extension = "png";

                }

                else if (
                    mime === "image/webp"
                ) {

                    extension = "webp";

                }


                /* =========================
                   DOWNLOAD
                ========================== */

                const downloadURL =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    downloadURL;


                link.download =
                    "toolton-resized-image."
                    + extension;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(
                    () => {
                        URL.revokeObjectURL(
                            downloadURL
                        );
                    },
                    1000
                );


                /* =========================
                   UPDATE INFORMATION
                ========================== */

                dimensionInfo.textContent =
                    "Output: "
                    + width
                    + " × "
                    + height
                    + " px";


                sizeInfo.textContent =
                    "File size: "
                    + formatBytes(
                        blob.size
                    );


                if (target) {

                    const targetText =
                        formatBytes(target);


                    if (
                        blob.size <= target
                    ) {

                        setStatus(
                            "Done! Image downloaded successfully. Target size: "
                            + targetText
                        );

                    }

                    else {

                        setStatus(
                            "Image downloaded. The closest practical file size was created: "
                            + formatBytes(blob.size)
                        );

                    }

                }

                else {

                    setStatus(
                        "Done! Your resized image has been downloaded."
                    );

                }


            }

            catch (error) {

                console.error(
                    error
                );


                setStatus(
                    "Something went wrong. Please try again."
                );

            }


            finally {

                resizeButton.disabled =
                    false;

            }

        }
    );



    /* =====================================
       RESET TOOL
    ====================================== */

    resetButton.addEventListener(
        "click",
        function () {

            /* Clear file */

            fileInput.value = "";


            /* Clear image */

            originalImage = null;

            originalFile = null;

            originalWidth = 0;

            originalHeight = 0;

            aspectRatio = 1;


            /* Hide editor */

            editor.classList.remove(
                "active"
            );


            /* Disable download */

            resizeButton.disabled =
                true;


            /* Clear preview */

            previewImage.src = "";

            previewImage.style.display =
                "none";


            previewPlaceholder.style.display =
                "block";


            /* Clear information */

            originalInfo.textContent =
                "Original: —";


            fileInfo.textContent =
                "File size: —";


            dimensionInfo.textContent =
                "Output: —";


            sizeInfo.textContent =
                "File size: —";


            /* Reset controls */

            presetInput.value =
                "custom";


            percentageInput.value =
                "custom";


            unitInput.value =
                "px";


            unitInput.dataset.previousUnit =
                "px";


            dpiInput.value =
                "300";


            widthInput.value =
                "";


            heightInput.value =
                "";


            lockRatio.checked =
                true;


            qualityInput.value =
                "90";


            qualityValue.textContent =
                "90";


            formatInput.value =
                "image/jpeg";


            targetSizeInput.value =
                "";


            targetUnitInput.value =
                "KB";


            /* Clear status */

            setStatus(
                ""
            );


            /* Remove old preview URL */

            if (previewURL) {

                URL.revokeObjectURL(
                    previewURL
                );

                previewURL = null;

            }

        }
    );



    /* =====================================
       INITIAL STATE
    ====================================== */

    resizeButton.disabled =
        true;


    editor.classList.remove(
        "active"
    );


    previewImage.style.display =
        "none";


    previewPlaceholder.style.display =
        "block";


    setStatus(
        ""
    );

});
                   
