let product_id = "";
let sku = "";
let variant_id = "";
let length = "";
let width = "";
let height = "";
let weight = "";
let fulfilmentCenterPincode = "";
let pincodeSubmitBttnElmnt = document.getElementById('pincodeSubmitBttn');
if (pincodeSubmitBttnElmnt) {
    pincodeSubmitBttnElmnt.addEventListener("click", function() {
        var pinCodeValue = document.getElementById('pincodeinput').value;
        if (pinCodeValue < 100000 || pinCodeValue > 999999) {
            document.getElementById("defaultOutputMsgId").innerHTML = "Invalid Pincode, Please Try again";
            return;
        }
        document.getElementById("defaultOutputMsgId").innerHTML = "Checking ..."
        var XMLR = new XMLHttpRequest();
        XMLR.timeout = 3000; // time in milliseconds
        XMLR.open(
            "POST", 
            "https://expressserver.fly.dev/calculateDeliveryTime",
            true
        );
        XMLR.setRequestHeader("Content-type", "application/json");
        /*XMLR.onreadystatechange = function() {
            console.log("onreadystatechange "+this.readyState+" "+this.status+" "+(this.responseText));
        };*/
        XMLR.ontimeout = function() {
            console.log("ontimeout");
            document.getElementById("defaultOutputMsgId").innerHTML = updateDeliveryTime(4,pinCodeValue);
        };
        XMLR.onload = function() {
            processResponse(this.responseText)
        };
        XMLR.onerror = function() {
            console.log("onerror");
            document.getElementById("defaultOutputMsgId").innerHTML = updateDeliveryTime(4,pinCodeValue);
        };
        XMLR.UNSENT = function() {
            console.log("Unsent");
            document.getElementById("defaultOutputMsgId").innerHTML = updateDeliveryTime(4,pinCodeValue);
        };
        XMLR.send(JSON.stringify({"postal_code": pinCodeValue,"fulfillment_center":fulfilmentCenterPincode,"items": [{"sku": sku,"quantity": 1,"product_id": product_id,"variant_id": variant_id,"length":length,"width":width,"height":height,"weight":weight}]}))
    })
}

function processResponse (res) {
    try {
        var jsonResponse = JSON.parse(res);
        if (jsonResponse.status == "success") {
            document.getElementById("defaultOutputMsgId").innerHTML = updateDeliveryTime(jsonResponse.minimum_delivery);
        } else {
            document.getElementById("defaultOutputMsgId").innerHTML = jsonResponse.message;
        }
    } catch (error) {
        document.getElementById("defaultOutputMsgId").innerHTML = updateDeliveryTime(3);
    }
}

function updateDeliveryTime (deliveryTimeInDays, zipcode) {
    if (zipcode) {
        if ((zipcode < 150000) || (zipcode > 200000) ) {deliveryTimeInDays = 3;}
        else if ((zipcode > 500000) && (zipcode < 700000) ) {deliveryTimeInDays = 2;}
        else if ((zipcode > 780000) && (zipcode < 800000) || (zipcode > 150000) && (zipcode > 200000)) {deliveryTimeInDays = 5;}
    }
    var today = new Date();
    var currentTime = today.getHours();
    var packaging_offset = 1;
    if (currentTime < pickup_time) {
        packaging_offset = 0;
    }
    var deliveryDate = new Date(new Date().setDate(new Date().getDate() + packaging_offset + deliveryTimeInDays));
    deliveryDate = deliveryDate.toString();
    var estmtdDelDay = deliveryDate.split(" ")[0];
    var estmtdDelMonth = deliveryDate.split(" ")[1];
    var estmtdDelDate = deliveryDate.split(" ")[2];
    return `Estimated Delivery by ${estmtdDelDay} ${estmtdDelMonth} ${parseInt(estmtdDelDate)}`
}