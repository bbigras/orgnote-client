var b=Object.defineProperty,S=Object.defineProperties;var V=Object.getOwnPropertyDescriptors;var d=Object.getOwnPropertySymbols;var x=Object.prototype.hasOwnProperty,C=Object.prototype.propertyIsEnumerable;var p=(t,e,o)=>e in t?b(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o,g=(t,e)=>{for(var o in e||(e={}))x.call(e,o)&&p(t,o,e[o]);if(d)for(var o of d(e))C.call(e,o)&&p(t,o,e[o]);return t},k=(t,e)=>S(t,V(e));import{q as w,e as f,l as u,ag as y,k as M,u as Q,al as D,o as n,f as I,a5 as h,a8 as _,ae as P,a4 as v,h as s,a3 as c}from"./index.a68bc811.js";import{u as q,a as B,b as U}from"./use-checkbox.704e7718.js";import{Q as E}from"./QSelect.9ad525fb.js";import{Q as L}from"./QPage.8b50794f.js";import"./use-dark.4e3578ff.js";import"./use-form.cb89fda3.js";import"./QField.dfa7ce29.js";import"./use-field.6b489874.js";import"./focus-manager.387b0375.js";import"./QItemSection.312d24df.js";import"./QItemLabel.41fff279.js";import"./QMenu.2fa72b7a.js";import"./use-tick.65c3baf2.js";import"./use-timeout.ef68d622.js";import"./use-key-composition.b8712bcd.js";import"./use-virtual-scroll.a4f5649c.js";import"./rtl.4b414a6d.js";var N=w({name:"QToggle",props:k(g({},q),{icon:String,iconColor:String}),emits:B,setup(t){function e(o,i){const l=f(()=>(o.value===!0?t.checkedIcon:i.value===!0?t.indeterminateIcon:t.uncheckedIcon)||t.icon),a=f(()=>o.value===!0?t.iconColor:null);return()=>[u("div",{class:"q-toggle__track"}),u("div",{class:"q-toggle__thumb absolute flex flex-center no-wrap"},l.value!==void 0?[u(y,{name:l.value,color:a.value})]:void 0)]}return U("toggle",e)}});const T={class:"col-12"},$={class:"text-h4 q-py-lg text-capitalize"},z={key:0},O={key:1},R={key:2},ne=M({__name:"ViewSettingsPage",setup(t){const e=Q(),o=D(e),i=[{label:"Light",value:!1},{label:"Dark",value:!0},{label:"System",value:"auto"}],l=a=>{e.setDarkMode(a)};return(a,r)=>(n(),I(L,null,{default:h(()=>[_("div",T,[_("h4",$,P(a.$t("view settings")),1),v(N,{modelValue:s(e).showUserProfiles,"onUpdate:modelValue":r[0]||(r[0]=m=>s(e).showUserProfiles=m),label:a.$t("Show author profile info")},null,8,["modelValue","label"]),v(E,{standout:"","onUpdate:modelValue":[l,r[1]||(r[1]=m=>s(o).darkMode=m)],modelValue:s(o).darkMode,options:i,label:"Dark mode","emit-value":"","map-options":""},{selected:h(()=>[s(o).darkMode==="auto"?(n(),c("span",z,"System")):s(o).darkMode?(n(),c("span",O,"Dark mode")):(n(),c("span",R,"Light mode"))]),_:1},8,["modelValue"])])]),_:1}))}});export{ne as default};
