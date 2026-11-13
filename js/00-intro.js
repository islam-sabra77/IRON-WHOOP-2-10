"use strict";
/* skip the intro if it already played this session (or in automated browsers, unless ?intro=1) */
try{if(sessionStorage.getItem("iron-intro")||navigator.webdriver&&!/[?&]intro=1/.test(location.search))document.getElementById("intro").remove()}catch(e){}
