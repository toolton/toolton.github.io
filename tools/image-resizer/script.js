/* =========================================
   TOOLTON IMAGE RESIZER
   SCRIPT.JS — PART 1/2
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ====================================== */

    const fileInput =
        document.getElementById("fileInput");

    const uploadArea =
        document.getElementById("uploadArea");

    const editor =
        document.getElementById("editor");

    const originalInfo =
        document.getElementById("originalInfo");

    const fileInfo =
        document.getElementById("fileInfo");

    const presetInput =
        document.getElementById("presetInput");

    const unitInput =
        document.getElementById("unitInput");

    const dpiInput =
        document.getElementById("dpiInput");

    const widthInput =
        document.getElementById("widthInput");

    const heightInput =
        document.getElementById("heightInput");

    const lockRatio =
        document.getElementById("lockRatio");

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
        document.getElementById(
            "previewPlaceholder"
        );

    const dimensionInfo =
        document.getElementById(
            "dimensionInfo"
        );

    const sizeInfo =
        document.getElementById(
            "sizeInfo"
        );

    const resizeButton =
        document.getElementById(
            "resizeButton"
        );

    const resetButton =
        document.getElementById(
            "resetButton"
        );

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
       BASIC HELPERS
    ====================================== */

    function formatBytes(bytes) {

        if (
            !bytes ||
            bytes <= 0
        ) {
            return "0 B";
        }

        const units = [
            "B",
            "KB",
            "MB",
            "GB"
        ];

        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );

        return (
            bytes /
            Math.pow(
                1024,
                index
            )
        ).toFixed(
            index === 0 ? 0 : 2
        )
        + " "
        + units[index];

    }


    function setStatus(message) {

        if (status) {
            status.textContent =
                message;
        }

    }


    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }


    /* =====================================
       IMAGE UPLOAD
    ====================================== */

    function loadImage(file) {

        if (!file) {
            return;
        }


        if (
            !file.type ||
            !file.type.startsWith(
                "image/"
            )
        ) {

            setStatus(
                "Please select a valid image."
            );

            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            setStatus(
                "Please choose JPG, PNG or WebP."
            );

            return;
        }


        originalFile =
            file;


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                const image =
                    new Image();


                image.onload =
                    function() {

                        originalImage =
                            image;


                        originalWidth =
                            image.naturalWidth;


                        originalHeight =
                            image.naturalHeight;


                        aspectRatio =
                            originalWidth /
                            originalHeight;


                        widthInput.value =
                            originalWidth;


                        heightInput.value =
                            originalHeight;


                        unitInput.value =
                            "px";


                        unitInput.dataset.previous =
                            "px";


                        dpiInput.value =
                            "300";


                        lockRatio.checked =
                            true;


                        originalInfo.textContent =
                            "Original: "
                            + originalWidth
                            + " × "
                            + originalHeight
                            + " px";


                        fileInfo.textContent =
                            "File size: "
                            + formatBytes(
                                file.size
                            );


                        editor.classList.add(
                            "active"
                        );


                        resizeButton.disabled =
                            false;


                        setStatus(
                            "Image loaded successfully."
                        );


                        updatePreview();

                    };


                image.onerror =
                    function() {

                        setStatus(
                            "Unable to read this image."
                        );

                    };


                image.src =
                    event.target.result;

            };


        reader.onerror =
            function() {

                setStatus(
                    "Unable to read the selected file."
                );

            };


        reader.readAsDataURL(
            file
        );

    }


    /* =====================================
       FILE INPUT
    ====================================== */

    fileInput.addEventListener(
        "change",
        function() {

            if (
                this.files &&
                this.files.length > 0
            ) {

                loadImage(
                    this.files[0]
                );

            }

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


            if (file) {

                loadImage(file);

            }

        }
    );


    /* =====================================
       UNIT CONVERSION
    ====================================== */

    function toPixels(
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


        if (unit === "mm") {

            return (
                value / 25.4
            ) * dpi;

        }


        return value;

    }


    function fromPixels(
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


        if (unit === "mm") {

            return (
                pixels / dpi
            ) * 25.4;

        }


        return pixels;

    }


    function getPixelDimensions() {

        let width =
            Number(
                widthInput.value
            );


        let height =
            Number(
                heightInput.value
            );


        if (
            !width ||
            !height ||
            width <= 0 ||
            height <= 0
        ) {

            return null;

        }


        const unit =
            unitInput.value;


        const dpi =
            Math.max(
                1,
                Number(
                    dpiInput.value
                ) || 300
            );


        width =
            toPixels(
                width,
                unit,
                dpi
            );


        height =
            toPixels(
                height,
                unit,
                dpi
            );


        return {

            width: clamp(
                Math.round(width),
                1,
                10000
            ),

            height: clamp(
                Math.round(height),
                1,
                10000
            )

        };

    }


    function setDimensionsFromPixels(
        width,
        height
    ) {

        const unit =
            unitInput.value;


        const dpi =
            Math.max(
                1,
                Number(
                    dpiInput.value
                ) || 300
            );


        const convertedWidth =
            fromPixels(
                width,
                unit,
                dpi
            );


        const convertedHeight =
            fromPixels(
                height,
                unit,
                dpi
            );


        if (unit === "px") {

            widthInput.value =
                Math.round(
                    convertedWidth
                );


            heightInput.value =
                Math.round(
                    convertedHeight
                );

        }

        else {

            widthInput.value =
                convertedWidth.toFixed(
                    2
                );


            heightInput.value =
                convertedHeight.toFixed(
                    2
                );

        }

    }


    /* =====================================
       WIDTH — ASPECT RATIO
    ====================================== */

    widthInput.addEventListener(
        "input",
        function() {

            if (
                !originalImage
            ) {
                return;
            }


            if (
                !lockRatio.checked
            ) {

                updatePreview();

                return;

            }


            const width =
                Number(
                    widthInput.value
                );


            if (
                !width ||
                width <= 0
            ) {

                return;

            }


            const dpi =
                Math.max(
                    1,
                    Number(
                        dpiInput.value
                    ) || 300
                );


            const widthPx =
                toPixels(
                    width,
                    unitInput.value,
                    dpi
                );


            const heightPx =
                widthPx /
                aspectRatio;


            const convertedHeight =
                fromPixels(
                    heightPx,
                    unitInput.value,
                    dpi
                );


            if (
                unitInput.value ===
                "px"
            ) {

                heightInput.value =
                    Math.round(
                        convertedHeight
                    );

            }

            else {

                heightInput.value =
                    convertedHeight.toFixed(
                        2
                    );

            }


            updatePreview();

        }
    );


    /* =====================================
       HEIGHT — ASPECT RATIO
    ====================================== */

    heightInput.addEventListener(
        "input",
        function() {

            if (
                !originalImage
            ) {
                return;
            }


            if (
                !lockRatio.checked
            ) {

                updatePreview();

                return;

            }


            const height =
                Number(
                    heightInput.value
                );


            if (
                !height ||
                height <= 0
            ) {

                return;

            }


            const dpi =
                Math.max(
                    1,
                    Number(
                        dpiInput.value
                    ) || 300
                );


            const heightPx =
                toPixels(
                    height,
                    unitInput.value,
                    dpi
                );


            const widthPx =
                heightPx *
                aspectRatio;


            const convertedWidth =
                fromPixels(
                    widthPx,
                    unitInput.value,
                    dpi
                );


            if (
                unitInput.value ===
                "px"
            ) {

                widthInput.value =
                    Math.round(
                        convertedWidth
                    );

            }

            else {

                widthInput.value =
                    convertedWidth.toFixed(
                        2
                    );

            }


            updatePreview();

        }
    );


    /* =====================================
       UNIT CHANGE
    ====================================== */

    unitInput.addEventListener(
        "change",
        function() {

            if (
                !originalImage
            ) {

                return;

            }


            const oldUnit =
                unitInput.dataset.previous
                || "px";


            const oldDpi =
                Math.max(
                    1,
                    Number(
                        dpiInput.value
                    ) || 300
                );


            let widthPx =
                Number(
                    widthInput.value
                );


            let heightPx =
                Number(
                    heightInput.value
                );


            widthPx =
                toPixels(
                    widthPx,
                    oldUnit,
                    oldDpi
                );


            heightPx =
                toPixels(
                    heightPx,
                    oldUnit,
                    oldDpi
                );


            setDimensionsFromPixels(
                widthPx,
                heightPx
            );


            unitInput.dataset.previous =
                unitInput.value;


            updatePreview();

        }
    );


    /* =====================================
       DPI CHANGE
    ====================================== */

    dpiInput.addEventListener(
        "change",
        function() {

            if (
                !originalImage
            ) {

                return;

            }


            /*
             * Keep actual pixel dimensions
             * when changing DPI.
             */

            const dimensions =
                getPixelDimensions();


            if (!dimensions) {

                return;

            }


            setDimensionsFromPixels(
                dimensions.width,
                dimensions.height
            );


            updatePreview();

        }
    );


    /* =====================================
       LOCK RATIO
    ====================================== */

    lockRatio.addEventListener(
        "change",
        function() {

            if (
                !originalImage
            ) {

                return;

            }


            if (
                this.checked
            ) {

                const dimensions =
                    getPixelDimensions();


                if (
                    dimensions
                ) {

                    aspectRatio =
                        dimensions.width /
                        dimensions.height;

                }

            }

        }
    );


    /* =====================================
       QUALITY DISPLAY
    ====================================== */

    qualityInput.addEventListener(
        "input",
        function() {

            qualityValue.textContent =
                this.value;


            if (
                originalImage
            ) {

                updatePreview();

            }

        }
    );


    /* =====================================
       CANVAS
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


        const context =
            canvas.getContext(
                "2d"
            );


        context.imageSmoothingEnabled =
            true;


        context.imageSmoothingQuality =
            "high";


        return {
            canvas,
            context
        };

    }


    /* =====================================
       PREVIEW
    ====================================== */

    function updatePreview() {

        if (
            !originalImage
        ) {

            return;

        }


        const dimensions =
            getPixelDimensions();


        if (
            !dimensions
        ) {

            return;

        }


        const result =
            createCanvas(
                dimensions.width,
                dimensions.height
            );


        result.context.drawImage(
            originalImage,
            0,
            0,
            dimensions.width,
            dimensions.height
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


                if (
                    previewURL
                ) {

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
                    + dimensions.width
                    + " × "
                    + dimensions.height
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
   
/* =====================================
       FORMAT CHANGE
    ====================================== */

    formatInput.addEventListener(
        "change",
        function() {

            if (
                originalImage
            ) {

                updatePreview();

            }

        }
    );

    /* =====================================
       PASSPORT / SIZE PRESETS
    ====================================== */

    const presets = {

        passport35x45: {
            width: 35,
            height: 45,
            unit: "mm"
        },

        passport2x2: {
            width: 2,
            height: 2,
            unit: "in"
        },

        passport25x35: {
            width: 25,
            height: 35,
            unit: "mm"
        },

        signature: {
            width: 40,
            height: 20,
            unit: "mm"
        },

        square1: {
            width: 1,
            height: 1,
            unit: "in"
        },

        a4: {
            width: 210,
            height: 297,
            unit: "mm"
        }

    };


    presetInput.addEventListener(
        "change",
        function () {

            const preset =
                presets[this.value];


            if (!preset) {

                return;

            }


            unitInput.value =
                preset.unit;


            unitInput.dataset.previous =
                preset.unit;


            widthInput.value =
                preset.width;


            heightInput.value =
                preset.height;


            /*
             * Presets must use exact
             * independent dimensions.
             */

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
        function () {

            if (
                !originalImage ||
                this.value === "custom"
            ) {

                return;

            }


            const percentage =
                Number(
                    this.value
                );


            if (
                !percentage
            ) {

                return;

            }


            unitInput.value =
                "px";


            unitInput.dataset.previous =
                "px";


            const newWidth =
                Math.max(
                    1,
                    Math.round(
                        originalWidth *
                        percentage /
                        100
                    )
                );


            const newHeight =
                Math.max(
                    1,
                    Math.round(
                        originalHeight *
                        percentage /
                        100
                    )
                );


            widthInput.value =
                newWidth;


            heightInput.value =
                newHeight;


            lockRatio.checked =
                true;


            updatePreview();

        }
    );



    /* =====================================
       TARGET FILE SIZE
    ====================================== */

    function getTargetBytes() {

        const value =
            Number(
                targetSizeInput.value
            );


        if (
            !value ||
            value <= 0
        ) {

            return null;

        }


        if (
            targetUnitInput.value ===
            "MB"
        ) {

            return (
                value *
                1024 *
                1024
            );

        }


        return (
            value *
            1024
        );

    }



    /* =====================================
       CANVAS → BLOB
    ====================================== */

    function canvasToBlob(
        canvas,
        mime,
        quality
    ) {

        return new Promise(
            function (resolve) {

                canvas.toBlob(
                    function (blob) {

                        resolve(blob);

                    },
                    mime,
                    quality
                );

            }
        );

    }



    /* =====================================
       TARGET SIZE COMPRESSION
    ====================================== */

    async function compressToTarget(
        canvas,
        mime,
        targetBytes
    ) {

        let low =
            0.05;

        let high =
            1;

        let bestBlob =
            null;


        /*
         * Binary search for the
         * closest practical quality.
         */

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            const quality =
                (
                    low +
                    high
                ) / 2;


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
                blob.size <=
                targetBytes
            ) {

                bestBlob =
                    blob;

                low =
                    quality;

            }

            else {

                high =
                    quality;

            }

        }


        /*
         * If the requested target is
         * extremely small, return the
         * lowest practical quality.
         */

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

            if (
                !originalImage
            ) {

                setStatus(
                    "Please choose an image first."
                );

                return;

            }


            const dimensions =
                getPixelDimensions();


            if (!dimensions) {

                setStatus(
                    "Please enter valid width and height."
                );

                return;

            }


            const width =
                clamp(
                    dimensions.width,
                    1,
                    10000
                );


            const height =
                clamp(
                    dimensions.height,
                    1,
                    10000
                );


            const result =
                createCanvas(
                    width,
                    height
                );


            result.context.drawImage(
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
                getTargetBytes();


            resizeButton.disabled =
                true;


            setStatus(
                "Processing your image..."
            );


            try {

                let blob;


                /*
                 * Target-size compression
                 * is supported for JPG
                 * and WebP.
                 */

                if (
                    target &&
                    (
                        mime ===
                        "image/jpeg" ||
                        mime ===
                        "image/webp"
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
                        "Image creation failed."
                    );

                }


                /* =========================
                   FILE EXTENSION
                ========================== */

                let extension =
                    "jpg";


                if (
                    mime ===
                    "image/png"
                ) {

                    extension =
                        "png";

                }

                else if (
                    mime ===
                    "image/webp"
                ) {

                    extension =
                        "webp";

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
                    function () {

                        URL.revokeObjectURL(
                            downloadURL
                        );

                    },
                    1000
                );


                /* =========================
                   RESULT INFORMATION
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


                setStatus(
                    "Done! Your resized image has been downloaded."
                );


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
       RESET
    ====================================== */

    resetButton.addEventListener(
        "click",
        function () {

            fileInput.value =
                "";


            originalImage =
                null;


            originalFile =
                null;


            originalWidth =
                0;


            originalHeight =
                0;


            aspectRatio =
                1;


            editor.classList.remove(
                "active"
            );


            resizeButton.disabled =
                true;


            previewImage.src =
                "";


            previewImage.style.display =
                "none";


            previewPlaceholder.style.display =
                "block";


            originalInfo.textContent =
                "Original: —";


            fileInfo.textContent =
                "File size: —";


            dimensionInfo.textContent =
                "Output: —";


            sizeInfo.textContent =
                "File size: —";


            widthInput.value =
                "";


            heightInput.value =
                "";


            presetInput.value =
                "custom";


            percentageInput.value =
                "custom";


            unitInput.value =
                "px";


            unitInput.dataset.previous =
                "px";


            dpiInput.value =
                "300";


            lockRatio.checked =
                true;


            formatInput.value =
                "image/jpeg";


            qualityInput.value =
                "90";


            qualityValue.textContent =
                "90";


            targetSizeInput.value =
                "";


            targetUnitInput.value =
                "KB";


            setStatus(
                ""
            );


            if (
                previewURL
            ) {

                URL.revokeObjectURL(
                    previewURL
                );


                previewURL =
                    null;

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

   

                
