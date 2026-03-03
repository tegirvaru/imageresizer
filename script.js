/* * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * CONSTANTS AND VARIABLES
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//if loading all files, preview the first one, then when save is pressed, it processes all of them
//if loading a single file, preivew it, then press save to download

//picking files save them all to a file objects, does not process them

//

//let size = 0;
const SVG_NS = "http://www.w3.org/2000/svg";
//let columns = 0;
let source = {
  filelist: [],
  name: "",
  single: true,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  w: 0,
  h: 0
};
let target = { w: 0, h: 0, scale: 1, square: true, x: 0, y: 0 };
let file = {
  prefix: "",
  rename: "",
  suffix: "",
  result: "",
  type: "",
  quality: 0.75,
  index: 0,
  png: "",
  webp: "",
  preset: "blue prince"
};
let SOURCECANVAS = null;
let TARGETCANVAS = null;
let SCTX = null;
let TCTX = null;

/* * * * * * * * * * * * * * * * * * * *
 *
 * LOADING AND STORAGE
 *
 * * * * * * * * * * * * * * * * * * * * * */

document.addEventListener("DOMContentLoaded", function () {
  //columns = window.innerWidth / targetSquare;
  //document.getElementById("getOriginal").checked = false;
  //document.getElementById("originalWidth").disabled = false;
  //document.getElementById("originalHeight").disabled = false;
  SOURCECANVAS = document.getElementById("sourcecanvas");
  TARGETCANVAS = document.getElementById("targetcanvas");
  SCTX = SOURCECANVAS.getContext("2d", { alpha: true });
  TCTX = TARGETCANVAS.getContext("2d", { alpha: true });
});

window.addEventListener("resize", () => {
  //columns = parseInt(window.innerWidth / parseInt(document.getElementById("inputResize").value.trim()));
  //columns = window.innerWidth / targetSquare;
});

/* * * * * * * * * *
 *
 * EVENTS
 *
 * * * * * * * * */

document.addEventListener("input", function (event) {
  // Check if the target is actually an input, select, or textarea
  if (
    event.target.tagName === "INPUT"
    //|| event.target.tagName === 'TEXTAREA'
    //|| event.target.tagName === 'SELECT'
  ) {
    //an element has changed, update relevent variable and reprocess preview
    if (event.target.type === "file") return; //must use change event, not input event
    if (source.filelist.length < 1) return; //there must be a file to show preview changes
    //update variable values as typed
    source.w = parseInt(document.getElementById("sourcew").value.trim() || 0);
    source.h = parseInt(document.getElementById("sourceh").value.trim() || 0);
    if (document.getElementById("square").checked) source.h = source.w;
    target.w = parseInt(document.getElementById("targetw").value.trim() || 0);
    target.h = parseInt(document.getElementById("targeth").value.trim() || 0);
    if (document.getElementById("square").checked) target.h = target.w;
    //check "square" last to change heights only if needed
    if (event.target.id === "square") {
      if (document.getElementById("square").checked) {
        source.h = source.w;
        document.getElementById("sourceh").value = source.h;
        document.getElementById("sourceh").disable = true;
        target.h = target.w;
        document.getElementById("targeth").value = target.h;
        document.getElementById("targeth").disable = true;
      } else {
        //only enable it if it should be (whatever state width is already in)
        source.h = source.w;
        document.getElementById("sourceh").value = source.h;
        document.getElementById("sourceh").disable = document.getElementById("sourcew").disable;
        target.h = target.w;
        document.getElementById("targeth").value = target.h;
        document.getElementById("targeth").disable = document.getElementById("targetw").disable;
      }
      return;
    }
    //check batch options
    if (event.target.id === "batch") {
      if (document.getElementById("batch").checked) {
        document.getElementById("save").disabled = true;
        document.getElementById("saveall").disabled = false;
      } else {
        document.getElementById("save").disabled = false;
        document.getElementById("saveall").disabled = true;
      }
      return;
    }
  }
  //file variables
  file.prefix = document.getElementById("fileprefix").value.trim();
  file.rename = document.getElementById("filerename").value.trim();
  file.suffix = document.getElementById("filesuffix").value.trim();

  switch (file.preset) {
    case "none":
      break;
    case "factorio":
      break;
    case "outer wilds":
      break;
    case "blue prince":
      //will do later when i add the rest
      source.x = (source.width - source.w) / 2;
      document.getElementById("sourcex").value = source.x;
      source.y = (source.height - source.h) / 2;
      document.getElementById("sourcey").value = source.y;
      target.x = 0;
      document.getElementById("targetx").value = target.x;
      target.y = 0;
      document.getElementById("targety").value = target.y;
      target.scale = target.w / source.w;
      document.getElementById("targetscale").value = target.scale;
      break;
  }

  //update the preview file
  processImage(source.filelist[file.index]);
});

function updateFileName() {
  file.result = "";
  file.result += `${file.prefix}`;
  if (file.rename !== "") {
    file.result += `${file.rename}`;
  } else {
    file.result += `${source.name.slice(0, -4)}`;
  }
  file.result += `${file.suffix}`;
  if (document.getElementById("filesuffixsize").checked) file.result += `${target.w}`;
  document.getElementById("fileresult").value = file.result;
}

function changePreset(event) {
  //diasble all textboxes, then enable relevant ones
  file.preset = event.target.value;
  //PUT THESE INTO THEIR RESPECTIVE PLACES
  //check cropping options
  //if (document.getElementById("cropnone").checked) {
  //  source.x = 0;
  //  document.getElementById("x").value = "";
  //  document.getElementById("x").disable = true;
  //  source.y = 0;
  //  document.getElementById("y").value = "";
  //  document.getElementById("y").disable = true;
  //  source.w = source.width;
  //  document.getElementById("sourcew").value = "";
  //  document.getElementById("sourcew").disable = true;
  //  source.h = source.height;
  //  document.getElementById("sourceh").value = "";
  //  document.getElementById("sourceh").disable = true;
  //  document.getElementById("cropsquare").disable = true;
  //  document.getElementById("cropsquare").checked = false;
  //}
  //if (document.getElementById("cropcentered").checked) {
  //  document.getElementById("x").value = "";
  //  document.getElementById("x").disable = true;
  //  document.getElementById("y").value = "";
  //  document.getElementById("y").disable = true;
  //  document.getElementById("sourcew").value = "";
  //  document.getElementById("sourcew").disable = false;
  //  source.x = (source.width - source.w) / 2;
  //  document.getElementById("sourceh").value = "";
  //  document.getElementById("sourceh").disable = false;
  //  source.y = (source.height - source.h) / 2;
  //  document.getElementById("cropsquare").disable = false;
  //}
  switch (file.preset) {
    case "none":
      break;
    case "factorio":
      break;
    case "outer wilds":
      break;
    case "blue prince":
      //will do later when i add the rest
      break;
  }
}

function pickFiles(event) {
  source.filelist = Array.from(event.target.files); //files from input element
  //empty the value string or the change event wont fire next time if the file isnt picked (no change)
  event.target.value = "";
  file.index = 0;
  document.getElementById("save").disabled = false;
  if (source.filelist.length < 1) {
    document.getElementById("sourceamount").value = "";
    document.getElementById("save").disabled = true;
    document.getElementById("savenext").disabled = true;
    document.getElementById("saveall").disabled = true;
    return;
  } else if (source.filelist.length === 1) {
    document.getElementById("sourceamount").value = `${file.index + 1} file`;
    document.getElementById("save").disabled = false;
    document.getElementById("savenext").disabled = true;
    document.getElementById("saveall").disabled = true;
  } else if (source.filelist.length > 1) {
    document.getElementById("sourceamount").value = `file: ${file.index + 1} of ${source.filelist.length}`;
    document.getElementById("save").disabled = false;
    document.getElementById("savenext").disabled = false;
    document.getElementById("saveall").disabled = true;
  }
  //preview first file's original image and output image
  //keep all files in list for when processing to download
  processImage(source.filelist[file.index]);
}

function processImage(imgfile) {
  return new Promise((resolve, reject) => {
    let fileHREF = URL.createObjectURL(imgfile);
    let img = new Image();
    img.onload = () => {
      let properties = {};
      source.name = imgfile.name;
      document.getElementById("sourcename").value = source.name;
      source.width = img.naturalWidth;
      document.getElementById("sourcewidth").value = source.width;
      source.height = img.naturalHeight;
      document.getElementById("sourceheight").value = source.height;
      SOURCECANVAS.width = source.width;
      SOURCECANVAS.height = source.height;
      SCTX.drawImage(img, 0, 0, source.width, source.height);

      //if size should be checked - add a function here
      //let largest = properties.width;
      //if (properties.height > properties.width) largest = properties.height;
      //let offsetx = (size * (largest - properties.width)) / (2 * largest);
      //let offsety = (size * (largest - properties.height)) / (2 * largest);
      //let targetw = (size * properties.width) / largest;
      //let targeth = (size * properties.height) / largest;

      //let targetw = (size * properties.width) / largest;
      //let targeth = (size * properties.height) / largest;

      TARGETCANVAS.width = target.w;
      TARGETCANVAS.height = target.h;
      //values calculated above so that these defaults stay valid for the selected options
      TCTX.drawImage(img, source.x, source.y, source.w, source.h, target.x, target.y, target.w, target.h);
      //both are base64
      file.png = TARGETCANVAS.toDataURL("image/png");
      document.getElementById("pngbase64").value = file.png;
      file.webp = TARGETCANVAS.toDataURL("image/webp", file.quality); // 0.75
      document.getElementById("webpbase64").value = file.webp;
      updateFileName();
      URL.revokeObjectURL(fileHREF);
      img = null;
      resolve(); //return the properties{base64,filename,png,w,h} created
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

function clickSave() {
  //save png
  if (document.getElementById("filetypepng").checked) {
    let linkpng = document.createElement("a");
    linkpng.download = `${file.result}.png`;
    linkpng.href = file.png;
    document.body.append(linkpng);
    linkpng.click();
    linkpng.remove();
  }
  //save webp
  if (document.getElementById("filetypewebp").checked) {
    let linkwebp = document.createElement("a");
    linkwebp.download = `${file.result}.webp`;
    linkwebp.href = file.webp;
    document.body.append(linkwebp);
    linkwebp.click();
    linkwebp.remove();
  }
  //check next
  //document.getElementById("sourceamount").value = `file: ${file.index + 1} of ${source.filelist.length}`;
  document.getElementById("savenext").disable = true;
  if (file.index + 1 < source.filelist.length) document.getElementById("savenext").disable = false;
  document.getElementById("saveall").disable = true;
  if (file.index + 1 < source.filelist.length) document.getElementById("saveall").disable = false;
}

function clickSaveNext() {
  //save the current file, iterate to load the next one, if there is one
  clickSave();
  //must check next in save function before adding 1 to index
  file.index++;
  document.getElementById("sourceamount").value = `file: ${file.index + 1} of ${source.filelist.length}`;
  processImage(source.filelist[file.index]);
}

//TIMER so download isn't spammed
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//
async function clickSaveAll() {
  while (file.index < source.filelist.length) {
    document.getElementById("sourceamount").value = `file: ${file.index + 1} of ${source.filelist.length}`;
    try {
      await processImage(source.filelist[file.index]);
      clickSaveNext();
    } catch (error) {
      console.log("load catch error: " + error);
    }
    await sleep(500);
    if (file.index > 20) return;
    if (document.getElementById("stop").checked) return;
  }
}
