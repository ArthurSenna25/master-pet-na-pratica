/* Se o pacote _ds_bundle.js não existir, carrega os componentes reais (.jsx) deste sistema. Fonte única — nada duplicado. */
(function(){function has(){for(var k of Object.keys(window)){try{var v=window[k];if(v&&typeof v==='object'&&v.Button&&v.CamilaFrame)return true}catch(e){}}return false}
if(has())return;var base=document.currentScript.src.replace(/[^\/]*$/,'');
var files=['icons/Icon','buttons/Button','brand/Wordmark','brand/Seal','brand/SiteHeader','forms/Input','cards/Card','signature/CamilaFrame'];
var src='const {useState}=React;\n'+files.map(function(f){var x=new XMLHttpRequest();x.open('GET',base+f+'.jsx',false);x.send();return x.responseText.replace(/^import .*$/gm,'').replace(/export function/g,'function')}).join('\n');
var names=['Icon','Button','Wordmark','Seal','SiteHeader','Input','Card','CamilaFrame'];
var code=Babel.transform('(function(React){'+src+'\nreturn {'+names.join(',')+'}})',{presets:['react']}).code;window.MPFallback=(0,eval)(code)(React);})();
