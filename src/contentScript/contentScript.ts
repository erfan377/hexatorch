

console.log("hello world");
chrome.runtime.onMessage.addListener(function(msg, sender){
    console.log("the response is "+msg.msg);
    alert("the response is "+msg.msg);
    if(msg.msg == "approved"){
        console.log("I hear approved");
        showApproved();
    }
    else if (msg.msg == "blocked"){
        console.log("I hear blocked");
        showBlocked();
    }
    return true;
});

var iframe = document.createElement('iframe'); 
iframe.style.background = "green";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.frameBorder = "none"; 
iframe.src = chrome.extension.getURL("popup.html");



function showApproved(){
    if(iframe.style.width == "0px"){
        console.log("show approved iframe");
        iframe.style.width="400px";
        iframe.style.background = "green";
        document.body.appendChild(iframe);
    }
    else{
        iframe.style.width="0px";
    }
}

function showBlocked(){
    if(iframe.style.width == "0px"){
        console.log("show blocked iframe");
        iframe.style.width="400px";
        iframe.style.background = "red";
        document.body.appendChild(iframe);
    }
    else{
        iframe.style.width="0px";
    }
}

