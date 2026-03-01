/* * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * CONSTANTS AND VARIABLES
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//let size = 0;
const SVG_NS = "http://www.w3.org/2000/svg";
let columns = 0;
let pickedFiles = null; //hold the files received by the picker
let source = { name:"", width: 1920, height: 1080, cropx: 0, cropy: 0, cropwidth: 512, cropheight: 512, cropsquare: true };
let target = { width: 512, height: 512, square:true,scale: 1 };
let file = { prefix: "", rename: "", suffix: "", full: "", type: "", quality: 0.75 };

/* * * * * * * * * * * * * * * * * * * *
 *
 * LOADING AND STORAGE
 *
 * * * * * * * * * * * * * * * * * * * * * */

document.addEventListener("DOMContentLoaded", function () {
  columns = window.innerWidth / targetSquare;
  //document.getElementById("getOriginal").checked = false;
  //document.getElementById("originalWidth").disabled = false;
  //document.getElementById("originalHeight").disabled = false;
});

window.addEventListener("resize", () => {
  //columns = parseInt(window.innerWidth / parseInt(document.getElementById("inputResize").value.trim()));
  columns = window.innerWidth / targetSquare;
});

/* * * * * * * * * *
 *
 * EVENTS
 *
 * * * * * * * * */

//TIMER so download isn't spammed
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function changeFile(event) {
  pickedFiles = Array.from(event.target.files); //files from input element
  //empty the value string or the change event wont fire next time if the file isnt picked (no change)
  event.target.value = "";

  targetSquare = parseInt(document.getElementById("resize-dimension-v").value.trim()) || 512;
  filePrefix = document.getElementById("filename-prefix").value.trim();
  fileName = document.getElementById("filename-rename-v").value.trim();
  fileSuffix = document.getElementById("filename-suffix").value.trim();
  fileQuality = parseFloat(document.getElementById("filetype-quality").value.trim()) || 0.75;
  sourceCrop = parseInt(document.getElementById("source-crop-v").value.trim()) || 2080;
  for (let i = 0; i < pickedFiles.length; i++) {
    try {
      const properties = await helperProcessImage(pickedFiles[i]);
      document.getElementById("source-width").value = properties.sourcewidth;
      document.getElementById("source-height").value = properties.sourceheight;
      document.getElementById("crop-x").value = properties.cropx;
      document.getElementById("crop-y").value = properties.cropy;
      document.getElementById("resize-scale-v").value = properties.scale;
      //create filename
      fileNameFull = "";
      if (filePrefix) fileNameFull += `${filePrefix}`;
      if (fileName) {
        fileNameFull += `${fileName}`;
      } else {
        fileNameFull += `${properties.filename.slice(0, -4)}`;
      }
      if (fileSuffix) fileNameFull += `${fileSuffix}`;
      if (document.getElementById("filename-suffix-size").checked) fileName += `${targetSquare}`;
      //save png 256
      if (document.getElementById("filetype-png").checked) {
        let linkpng = document.createElement("a");
        linkpng.download = `${fileNameFull}.png`;
        linkpng.href = properties.png;
        document.body.append(linkpng);
        linkpng.click();
        linkpng.remove(linkpng);
      }
      //save webp
      if (document.getElementById("filetype-webp").checked) {
        let linkwebp = document.createElement("a");
        linkwebp.download = `${fileNameFull}.webp`;
        linkwebp.href = properties.base64;
        document.body.append(linkwebp);
        linkwebp.click();
        linkwebp.remove(linkwebp);
      }
      //show preview
      if (document.getElementById("preview").checked) {
        const svgHolder = document.createElementNS(SVG_NS, "svg");
        svgHolder.setAttribute("width", targetSquare);
        svgHolder.setAttribute("height", targetSquare);
        document.getElementById("view").append(svgHolder);
        const svgAfter = document.createElementNS(SVG_NS, "image"); //    <----- notice the svg NS
        svgAfter.setAttribute("x", 0);
        svgAfter.setAttribute("y", 0);
        svgAfter.setAttribute("width", targetSquare);
        svgAfter.setAttribute("height", targetSquare);
        svgAfter.setAttribute("href", properties.base64);
        svgHolder.append(svgAfter);
      }
      await sleep(500);
    } catch (error) {
      console.log("load catch error: " + error);
    }
  }
}

function helperProcessImage(imgFile) {
  return new Promise((resolve, reject) => {
    let fileHREF = URL.createObjectURL(imgFile);
    let img = new Image();
    img.onload = () => {
      let properties = {};
      properties.filename = imgFile.name;
      properties.sourcewidth = img.naturalWidth;
      properties.sourceheight = img.naturalHeight;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      //let largest = properties.width;
      //if size should be checked - add a function here
      //if (properties.height > properties.width) largest = properties.height;
      //let offsetx = (size * (largest - properties.width)) / (2 * largest);
      //let offsety = (size * (largest - properties.height)) / (2 * largest);
      //let targetw = (size * properties.width) / largest;
      //let targeth = (size * properties.height) / largest;
      //canvas.width = size;
      //canvas.height = size;
      //ctx.drawImage(img, 0, 0, properties.width, properties.height, offsetx, offsety, targetw, targeth);
      properties.scale = 1;
      if (document.getElementById("source-crop").checked) {
        properties.scale = targetSquare / sourceCrop;
      } else {
        //no scaling, just cropping
        sourceCrop = targetSquare;
      }
      if (document.getElementById("crop-centered").checked) {
        properties.sourceoffsetx = (properties.sourcewidth - sourceCrop) / 2;
        properties.sourceoffsety = (properties.sourceheight - sourceCrop) / 2;
      }
      if (document.getElementById("resize-dimension").checked) {
        properties.sourceoffsetx = (properties.sourcewidth - sourceCrop) / 2;
        properties.sourceoffsety = (properties.sourceheight - sourceCrop) / 2;
      }
      //let targetw = (size * properties.width) / largest;
      //let targeth = (size * properties.height) / largest;
      canvas.width = targetSquare;
      canvas.height = targetSquare;
      ctx.drawImage(
        img,
        properties.sourceoffsetx,
        properties.sourceoffsety,
        sourceCrop,
        sourceCrop,
        0,
        0,
        targetSquare,
        targetSquare
      );

      properties.png = canvas.toDataURL("image/png");
      properties.base64 = canvas.toDataURL("image/webp", fileQuality); // 0.75
      URL.revokeObjectURL(fileHREF);
      img = null;
      resolve(properties); //return the properties{base64,filename,png,w,h} created
    };
    img.onerror = (error) => {
      img = null;
      URL.revokeObjectURL(fileHREF);
      console.log("didnt onload");
      reject(error);
    };
    img.src = fileHREF;
  });
}

/* * * * * * * * * * * * * * * * * * * *
 *
 * INPUT LOGIC
 *
 * * * * * * * * * * * * * * * * * * * * * */

//document.getElementById("originalWidth").disabled = true;
