let rlist = [];
let positioned = [];
let unpositioned = [];
let numberOfBox = 0;

function Upload() {
  //Reference the FileUpload element.
  // var fileUpload = document.getElementById("fileUpload");
  var fileUpload = document.getElementById("uploaded-excel");

  //Validate whether File is valid Excel file.
  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
  console.log(fileUpload);
  console.log(fileUpload.value);
  console.log(fileUpload.value.toLowerCase());
  console.log(regex.test(fileUpload.value.toLowerCase()));
  if (regex.test(fileUpload.value.toLowerCase())) {
    if (typeof FileReader != "undefined") {
      var reader = new FileReader();

      //For Browsers other than IE.
      if (reader.readAsBinaryString) {
        reader.onload = function (e) {
          ProcessExcel(e.target.result);
        };
        reader.readAsBinaryString(fileUpload.files[0]);
      } else {
        //For IE Browser.
        reader.onload = function (e) {
          var data = "";
          var bytes = new Uint8Array(e.target.result);
          for (var i = 0; i < bytes.byteLength; i++) {
            data += String.fromCharCode(bytes[i]);
          }
          ProcessExcel(data);
        };
        reader.readAsArrayBuffer(fileUpload.files[0]);
      }
    } else {
      alert("This browser does not support HTML5.");
    }
    return true;
  } else {
    alert("Please upload a valid Excel file.");
    return false;
  }
}
function ProcessExcel(data) {
  //Read the Excel File data.
  var workbook = XLSX.read(data, {
    type: "binary",
  });

  //Fetch the name of First Sheet.
  var firstSheet = workbook.SheetNames[0];

  /////////////////////
  var excelRows = XLSX.utils.sheet_to_row_object_array(
    workbook.Sheets[firstSheet]
  );

  console.log(excelRows);

  //Create a HTML Table element.
  var table = document.createElement("table");
  table.border = "1";

  //Add the header row.
  var row = table.insertRow(-1);

  //Add the header cells.
  var headerCell = document.createElement("TH");
  headerCell.innerHTML = "Exhibit";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Project";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Dimension";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Tag";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Allocation";
  row.appendChild(headerCell);

  dimensions = [];
  tags = [];
  projIDs = [];
  //Add the data rows from Excel file.
  for (var i = 1; i < excelRows.length; i++) {
    //Add the data row.
    var row = table.insertRow(-1);

    //Add the data cells.
    if (excelRows[i].Exhibit != undefined) {
      var cell = row.insertCell(-1);
      cell.innerHTML = excelRows[i].Exhibit;
    }
    var projName = "__EMPTY";
    if (excelRows[i][projName] != undefined) {
      var cell = row.insertCell(-1);
      cell.innerHTML = excelRows[i][projName];
    }

    spaceNeeded = "Showcase Space Needed: L x W x H";
    var dimension = excelRows[i][spaceNeeded];
    if (dimension != undefined) {
      // console.log(
      //   "this is what the dimension is supposed to look like",
      //   dimension
      // );
      d = dimension.split("x");
      for (let index = 0; index < d.length; index++) {
        // d[index] = parseInt(d[index].replace(/[^0-9\.]/g, ""), 10);
        d[index] = parseFloat(d[index].replace(/^[+-]?\d+(\.\d+)?$/g, ""));
      }
      dimensions.push(d);
      cell = row.insertCell(-1);
      let str = "";
      for (let i = 0; i < d.length; i++) {
        str = str + d[i] + " x ";
      }
      str = str.substring(0, str.length - 3);
      cell.innerHTML = str;
    }

    if (excelRows[i].Tag != undefined) {
      var cell = row.insertCell(-1);
      cell.innerHTML = excelRows[i].Tag;
    }

    if (i != excelRows.length - 1) {
      cell = row.insertCell(-1);
      cell.id = "assign" + i;
      cell.className = "allocation";
      cell.innerHTML = "Unallocated";
    }

    var tag = excelRows[i].Tag;

    tags.push(tag);
    projIDs.push(excelRows[i].Exhibit);
  }

  for (let index = 0; index < dimensions.length; index++) {
    rlist.push(
      new Rect(
        undefined,
        undefined,
        dimensions[index][0],
        dimensions[index][1],
        tags[index],
        projIDs[index]
      )
    );
  }

  var tablescroll = document.getElementById("table-scroll");
  tablescroll.innerHTML = "";
  tablescroll.appendChild(table);
}
function Run() {
  let count = 0;
  //reset allocation
  var resetallocat = document.getElementsByClassName("allocation");
  for (var i = 0, len = resetallocat.length | 0; i < len; i = (i + 1) | 0) {
    resetallocat[i].innerHTML = "Unallocated";
  }
  let packer;
  let updatedList = [...rlist];
  let binsTop = [];
  let binsBottom = [];
  bins = document.getElementsByClassName("bin");
  for (const bin of bins) {
    bin.innerHTML = null;
    if (bin.parentElement.id == "container") {
      binsTop.push(bin);
    }
    if (bin.parentElement.id == "container2") {
      binsBottom.push(bin);
    }
  }
  let containers = binsBottom.concat(binsTop);
  //console.log("debug", containers);

  containers.forEach((container) => {
    console.log("debug", container.id);

    cWidth = parseInt(container.style.width.replace(/[^0-9\.]/g, ""), 10);
    cHeight = parseInt(container.style.height.replace(/[^0-9\.]/g, ""), 10);
    let el = document.getElementById(container.id);
    let st = window.getComputedStyle(el, null);
    let tr =
      st.getPropertyValue("-webkit-transform") ||
      st.getPropertyValue("-moz-transform") ||
      st.getPropertyValue("-ms-transform") ||
      st.getPropertyValue("-o-transform") ||
      st.getPropertyValue("transform") ||
      "fails..";
    var styleValue = tr.split("(")[1];
    styleValue = styleValue.split(")")[0];
    styleValue = styleValue.split(",");
    var a = styleValue[0];
    var b = styleValue[1];
    var c = styleValue[2];
    var d = styleValue[3];
    var scale = Math.sqrt(a * a + b * b);

    console.log(document.getElementById(container.id).getAttribute("value"));
    initialDimension = document
      .getElementById(container.id)
      .getAttribute("value")
      .split(",");

    scaledWidth =
      parseFloat(initialDimension[0]) * parseFloat(initialDimension[1]) * scale;
    scaledHeight =
      parseFloat(initialDimension[0]) * parseFloat(initialDimension[2]) * scale;
    //console.log("debug Area=", scaledWidth * scaledHeight);
    packer = new BinPack(scaledWidth, scaledHeight);
    let values = packer.addAll(updatedList);
    updatedList = values[1];
    //console.log("debug unallocated", updatedList);
    let M_TO_PX = 41.3;
    positioned = packer.positioned;
    if (packer.unpositioned.length > 0) {
      let temparray = [];
      for (let index = 0; index < packer.unpositioned.length; index++) {
        const element = packer.unpositioned[index];
        element.projID = element.datum.projID;
        element.tag = element.datum.tag;
        temparray.push(element);
      }
      updatedList = updatedList.concat(temparray);
    }
    packer.positioned.forEach((element) => {
      if (element.projID == 3) {
        console.log("hello i am 3");
      }
      div = document.createElement("div");
      div.id = numberOfBox;
      div.style.left = (element.x * M_TO_PX) / scale + "px";
      div.style.top = (element.y * M_TO_PX) / scale + "px";
      div.style.width = (element.width * M_TO_PX) / scale + "px";
      div.style.height = (element.height * M_TO_PX) / scale + "px";
      div.style.position = "absolute";
      div.style.backgroundColor = getColor(element.datum.tag);
      div.style.opacity = "1";
      div.style.border = "0.1px solid black";
      div.innerHTML = element.datum.projID;
      div.className = "box";
      document.getElementById("assign" + element.datum.projID).innerHTML =
        "Allocated";
      container.appendChild(div);
      numberOfBox++;
      count++;
    });
    console.log("debug count", count);

    //getElementById("dv").innerHTML = "Allocated";
    // console.log("debug unallocated", updatedList);
  });
}

function getColor(tag) {
  switch (parseInt(tag)) {
    case 1:
      return "#FF5733";
    case 2:
      return "#74FF33";
    case 3:
      return "#33E6ff";
    case 4:
      return "#334CFF";
    case 5:
      return "#DD33FF";
  }
}

$(function () {
  $(".table-scroll").scroll(function () {
    $(".table-scroll table").width(
      $(".table-scroll").width() + $(".table-scroll").scrollLeft()
    );
  });

  var tableTdWidths = new Array();
  var tableWidth = 0;
  var tableTr0Width = 0;
  var tableThNum = 0;
  var tableTr1Width = 0;

  // tableWidth = $(".table-scroll table").css("width").replace("px", "");
  tableThNum = $(".table-scroll tr:eq(0)").children("th").length;

  if ($(".table-scroll tr").length == 1) {
    // header only
    if (tableWidth > tableTr0Width) {
      $(".table-scroll tr:eq(0)")
        .children("th")
        .each(function (i) {
          $(this).width(
            parseInt(
              // $(this).css("width").replace("px", "") +
              parseInt(Math.floor((tableWidth - tableTr0Width) / tableThNum))
            ) + "px"
          );
        });
    }
  } else {
    // header and body
    // tableTr1Width = $(".table-scroll tr:eq(1)").css("width").replace("px", "");
    $(".table-scroll tr:eq(1)")
      .children("td")
      .each(function (i) {
        // tableTdWidths[i] = $(this).css("width").replace("px", "");
      });
    $(".table-scroll tr:eq(0)")
      .children("th")
      .each(function (i) {
        if (
          // parseInt($(this).css("width").replace("px", "")) >
          parseInt(tableTdWidths[i])
        ) {
          // tableTdWidths[i] = $(this).css("width").replace("px", "");
        }
      });

    if (tableWidth > tableTr1Width) {
      //set all th td width
      $(".table-scroll tr").each(function (i) {
        $(this)
          .children()
          .each(function (j) {
            $(this).css(
              "min-width",
              parseInt(tableTdWidths[j]) +
                parseInt(
                  Math.floor((tableWidth - tableTr1Width) / tableThNum)
                ) +
                "px"
            );
          });
      });
    } else {
      //method 1 : set all th td width
      $(".table-scroll tr").each(function (i) {
        $(this)
          .children()
          .each(function (j) {
            $(this).css("min-width", tableTdWidths[j] + "px");
          });
      });
    }
  }
});

// function getRandomColor() {
//   var letters = "0123456789ABCDEF";
//   var color = "#";
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }
