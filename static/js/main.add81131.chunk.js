(this.webpackJsonpabstract=this.webpackJsonpabstract||[]).push([[0],[,,,,,,function(e,t){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALcAAAETCAMAAABDSmfhAAAAIVBMVEXy8vLZ2dna2tre3t7h4eHw8PD09PTs7Ozm5ubj4+Pp6emhOneKAAAD3ElEQVR4nO3b2XKjMBBGYRYjlvd/4GERkpCMaewptZg531WccioNRp1fDakqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANUa7gC+NvXlg6aav63aoHle6edWLV/+wwrum3rSPKtwMtux6fFTdVbvX3dlvPONK7+voMjHD8IDOaMa97mkvtlkXaeml76uytq/NtL5qhq7k0m2Vwaq0bXHtjOVeL8avSltjV3vNWOpJ91W224Xh26L99lTiST9WuaxG/wH4k17eIjVNVOPQx2Vvn0VZTd28rfKtohap7x0CbTmdsbuu9njSy1ikce8QmDujdtVVEKmSJnKugLQbRKpubD4VGxjU6z5EKlP1spPuf1ztAI6RyphO0F5ee4wZtTrjp0h1rg9ijE5nNMlGR9AWG7e52F7P8SU3V2W7H4igLbpVmRx0Lu83Olf2CyPZ3eWr21VpF5gsrGxvfnPQucoOq1w3ZdKwsmwmkt1dvrqjKucFJit7fbM73dlnLncj1Ynsq/J+pHqnvf5Nf9mNJPWB6qr8XqPXvO9UOcQf0iv7X3nfxwZpgF2q7I9dKPfIPIxUxvTCxt2v2TU46U3equNIdSzmlI1Uxl9j2bcQPlJF8e6Tx0Yq+8OKkcp99Ekt5/xGJznoXGX/tNHxH0320+0u0Ncep6/Lng9ym9cmB51NGKmWMbGRhpV26ky6u8slqnIZE4vDSjO6051//pNU+VXGIlIJ674zOz6XPVJ14hz1kV6kuiNdEnmrDpv3JB7Bzr2jj96sGalMNwk7yTD3+OrwZt1INZcu2vhsPxrMa/Uilbsd/x9Eqq6ASBXOsS+4eW0Bkeqb2XEJkWq0ATa+0f32fNu73MnuLp8mLkYYVtYnDsqYHW+jbPH8pxnc5iL/+CHuHe1X0838q/J/ilSJp86O9SLVb/Qi1XjjxFdxZsw/O95/c1PJH394zX27O4yaNWfHy78GyKbHa5XhmxvFSLW9NpLb8W8POquHRqrKLTBXi3x2rBmplgtjva3wqNmx/f3zAruz0dnntX5grlH1WoE/X9dlL9fF8viD4qpMiG90L48/RK1Ite47jwy6L7SrnsmfGPT0nx2slkU63R3NlvCMaeU7o1T+SHVKmlNWRf0H2+ld7j5+4iB7pLpikjFxvc5roycOiliVEZPsDwYTL4BCVmXERJuJPcZoRiqhcJGWEqlk/KbMVelWpWph17bVWMBG5765M6YbHf1IJeDibrK7ewbFZ6l+4i6T7Lfjf7T/ySwoUsnY+FJUpBJa4ot2DV964NkGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/jj9cXSDEl6hGSAAAAABJRU5ErkJggg=="},function(e,t,a){e.exports=a(18)},,,,,function(e,t,a){},function(e,t,a){},function(e,t,a){},,function(e,t,a){},function(e,t,a){},function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),c=a(4),l=a.n(c),i=(a(12),a(1)),o=(a(13),a(14),a(2)),u=a.n(o),s=a(5),m="https://image.tmdb.org/t/p/w300";function d(e){return fetch("".concat("https://api.themoviedb.org/3","/movie/").concat(e,"?api_key=").concat("ff95187858254f0132358f557f352e99","&language=en-US")).then((function(e){return e.json()})).then((function(e){return function(e){var t=e.id,a=e.title,n=(e.vote_average,e.poster_path),r=e.release_date,c=e.runtime;return[{id:t,year:new Date(r).getFullYear().toString(),title:a,rating:void 0,runtime:c,picture:n?"".concat(m).concat(n):void 0,lbDiaryLink:void 0,lbFilmLink:void 0}]}(e)})).catch((function(e){return[]}))}function p(e){return d(e.id).then((function(t){var a=e;return a.picture=t[0].picture,a}))}function h(e){for(var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=e.slice(e.indexOf("\n")+1).split("\n"),n=[],r=0;r<a.length;r++){var c=a[r];if(0!=c.length){for(var l=[],i="",o=!1,u=0;u<c.length;u++){if(o){if('"'===c[u]&&","===c[u+1]){o=!1;continue}}else{if(","===c[u]||u===c.length-1){t||u!==c.length-1||(i+=c[u]),l.push(i),i="";continue}if('"'===c[u]&&(0===u||","===c[u-1])){o=!0;continue}}i+=c[u]}","==c[c.length-1]&&l.push(""),n.push(l)}}return n}function g(){return(g=Object(s.a)(u.a.mark((function e(t,a,n,r,c,l,i,o,s,d,p,g,v,f){var A,b,E,y,x,j,O,w,N,k,S,_,L,F,V;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("Running script..."),e.next=3,window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"});case 3:return A=e.sent,e.next=6,A.loadPackage("micropip");case 6:return e.next=8,A.runPythonAsync("\n  import micropip\n  await micropip.install('unidecode')\n  ");case 8:return e.next=10,A.loadPackage("python-dateutil");case 10:return console.log("Loaded pyodide. Now fetch csv"),e.next=13,fetch("diary.csv",{method:"get",headers:{"content-type":"text/csv;charset=UTF-8"}});case 13:return e.next=15,e.sent.text();case 15:return b=e.sent,e.next=18,fetch("watchlist.csv",{method:"get",headers:{"content-type":"text/csv;charset=UTF-8"}});case 18:return e.next=20,e.sent.text();case 20:return E=e.sent,e.next=23,fetch("master.csv",{method:"get",headers:{"content-type":"text/csv;charset=UTF-8"}});case 23:return e.next=25,e.sent.text();case 25:return y=e.sent,e.next=28,fetch("map.csv",{method:"get",headers:{"content-type":"text/csv;charset=UTF-8"}});case 28:return e.next=30,e.sent.text();case 30:return x=e.sent,e.next=33,fetch("watched.csv",{method:"get",headers:{"content-type":"text/csv;charset=UTF-8"}});case 33:return e.next=35,e.sent.text();case 35:return j=e.sent,O=h(b,!0),w=h(y),N=h(j,!0),k=h(E,!0),S=h(x),console.log("Source: "+f),console.log("Sorting: "+g),console.log("Unrated: "+v),_={master:w,diary:O,watched:N,watchlist:k,mapping:S,name:a,year:n,date:r,rating:c,runtime:l,tags:i,director:o,writer:s,actor:d,genre:p,sorting:g,unrated:v,src:f},A.registerJsModule("my_js_namespace",_),e.next=48,A.runPythonAsync(t);case 48:if(L=e.sent,console.log("Debug: "+window.debug),console.log("Json: "+L),""!==L){e.next=53;break}return e.abrupt("return",[]);case 53:return F=JSON.parse(L),V=[],F.items.map((function(e){var t=e.watched,a=e.title,n=e.year,r=e.runtime,c=e.rating,l=e.tags,i=e.lbFilm,o=e.lbDiary,u=e.id,s=e.poster,d=(e.backdrop,e.directors);V.push({id:u,year:n,title:a,watched:t,rating:c,runtime:r,tags:l,picture:s?"".concat(m).concat(s):void 0,lbDiaryLink:o,lbFilmLink:i,directors:d})})),e.abrupt("return",V);case 57:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function v(e,t,a,n,r,c,l,i,o,u,s,m,d){return fetch("main.py").then((function(e){return e.text()})).then((function(p){return function(e,t,a,n,r,c,l,i,o,u,s,m,d,p){return g.apply(this,arguments)}(p,e,t,a,n,r,c,l,i,o,u,s,m,d)})).then((function(e){return Promise.all(e.map((function(e){return e.picture?e:p(e)}))).then((function(e){return e}))}))}var f=r.a.createContext({movies:[],updateMovies:Function,loading:!1,setLoading:Function}),A=function(){var e=Object(n.useState)(""),t=Object(i.a)(e,2),a=t[0],c=t[1],l=Object(n.useState)(""),o=Object(i.a)(l,2),u=o[0],s=o[1],m=Object(n.useState)(""),d=Object(i.a)(m,2),p=d[0],h=d[1],g=Object(n.useState)(""),A=Object(i.a)(g,2),b=A[0],E=A[1],y=Object(n.useState)(""),x=Object(i.a)(y,2),j=x[0],O=x[1],w=Object(n.useState)(""),N=Object(i.a)(w,2),k=N[0],S=N[1],_=Object(n.useState)(""),L=Object(i.a)(_,2),F=L[0],V=L[1],P=Object(n.useState)(""),D=Object(i.a)(P,2),C=D[0],U=D[1],q=Object(n.useState)(""),J=Object(i.a)(q,2),W=J[0],T=J[1],X=Object(n.useState)(""),G=Object(i.a)(X,2),M=G[0],R=G[1],H=Object(n.useState)(""),B=Object(i.a)(H,2),K=B[0],I=B[1],Y=Object(n.useState)(""),Z=Object(i.a)(Y,2),z=Z[0],Q=Z[1],$=Object(n.useState)(""),ee=Object(i.a)($,2),te=ee[0],ae=ee[1],ne=Object(n.useContext)(f),re=ne.updateMovies,ce=ne.setLoading;return r.a.createElement("div",null,r.a.createElement("form",{name:"form",onSubmit:function(e){return e.preventDefault(),console.log("Handling preloaded"),ce(!0),console.log("Sorting value: "+K),console.log("Unrated value: "+z),void v(a,u,p,b,j,k.split(","),F,C,W,M,K||"watched",z,te||"diary").then((function(e){console.log("Got back "+e.length+" movie items"),ce(!1),re(e)}))},noValidate:!0},r.a.createElement("input",{type:"text",name:"movie",className:"search__input",placeholder:"Name ... ",value:a,onChange:function(e){return c(e.target.value)}}),r.a.createElement("input",{type:"text",name:"year",className:"search__input",placeholder:"Year ... ",value:u,onChange:function(e){return s(e.target.value)}}),r.a.createElement("input",{type:"text",name:"date",className:"search__input",placeholder:"Date ... ",value:p,onChange:function(e){return h(e.target.value)}}),r.a.createElement("input",{type:"text",name:"rating",className:"search__input",placeholder:"Rating ... ",value:b,onChange:function(e){return E(e.target.value)}}),r.a.createElement("input",{type:"text",name:"runtime",className:"search__input",placeholder:"Runtime ... ",value:j,onChange:function(e){return O(e.target.value)}}),r.a.createElement("input",{type:"text",name:"tags",className:"search__input",placeholder:"Tags ... ",value:k,onChange:function(e){return S(e.target.value)}}),"        ",r.a.createElement("input",{type:"text",name:"director",className:"search__input",placeholder:"Director ... ",value:F,onChange:function(e){return V(e.target.value)}}),r.a.createElement("input",{type:"text",name:"actor",className:"search__input",placeholder:"Writer ... ",value:C,onChange:function(e){return U(e.target.value)}}),r.a.createElement("input",{type:"text",name:"actor",className:"search__input",placeholder:"Actor ... ",value:W,onChange:function(e){return T(e.target.value)}}),r.a.createElement("input",{type:"text",name:"genre",className:"search__input",placeholder:"Genre ... ",value:M,onChange:function(e){return R(e.target.value)}}),r.a.createElement("label",null,r.a.createElement("input",{type:"checkbox",name:"checkbox",value:z,onChange:function(e){return Q(e.target.value)}}),"Unrated"),r.a.createElement("div",null,r.a.createElement("p",null,'Sorting (def "watched"):'),r.a.createElement("div",null,r.a.createElement("input",{type:"radio",id:"year",name:"sorting",value:"year",onChange:function(e){return I(e.target.value)}}),r.a.createElement("label",{htmlFor:"year"},"Year")),r.a.createElement("div",null,r.a.createElement("input",{type:"radio",id:"rating",name:"sorting",value:"rating",onChange:function(e){return I(e.target.value)}}),r.a.createElement("label",{htmlFor:"rating"},"Rating")),r.a.createElement("div",null,r.a.createElement("input",{type:"radio",id:"runtime",name:"sorting",value:"runtime",onChange:function(e){return I(e.target.value)}}),r.a.createElement("label",{htmlFor:"runtime"},"Runtime"))),r.a.createElement("div",null,r.a.createElement("p",null,'Source (def "diary"):'),r.a.createElement("div",null,r.a.createElement("input",{type:"radio",id:"watched",name:"src",value:"watched",onChange:function(e){return ae(e.target.value)}}),r.a.createElement("label",{htmlFor:"watched"},"Watched")),r.a.createElement("div",null,r.a.createElement("input",{type:"radio",id:"watchlist",name:"src",value:"watchlist",onChange:function(e){return ae(e.target.value)}}),r.a.createElement("label",{htmlFor:"watchlist"},"Watchlist"))),r.a.createElement("button",{name:"Button",className:"search__button",type:"submit"},"Search")))},b=(a(16),function(){return r.a.createElement("div",{className:"header"},r.a.createElement("h1",{className:"header__title"},"Abstract"),r.a.createElement("div",{className:"header__search"},r.a.createElement(A,null)))}),E=(a(17),a(6)),y=a.n(E),x=function(){var e=Object(n.useContext)(f),t=e.movies;return e.loading?r.a.createElement("div",null,r.a.createElement("h1",null,"LOADING")):r.a.createElement("div",{className:"catalogContainer"},t.map((function(e){return r.a.createElement("div",{className:"catalog__item",key:e.id},r.a.createElement("div",{className:"catalog__item__img"},r.a.createElement("img",{src:e.picture||y.a,alt:e.title})),r.a.createElement("div",{className:"catalog__item__info"},r.a.createElement("div",{className:"titleYear"},r.a.createElement("span",{className:"title"},r.a.createElement("a",{href:e.lbFilmLink},e.title)),r.a.createElement("span",{className:"year"},"(",e.year,")")),r.a.createElement("div",{className:"watchedRating"},r.a.createElement("span",{className:"watched"},r.a.createElement("a",{href:e.lbDiaryLink},e.watched)),r.a.createElement("span",{className:e.rating?"rating":"year"},e.rating)),r.a.createElement("div",{className:"tags"},e.tags?e.tags.map((function(e){return r.a.createElement("span",{className:"tag"},e)})):r.a.createElement("span",null)),r.a.createElement("div",{className:"directors"},e.directors?e.directors.map((function(e){return r.a.createElement("span",{className:"director"},e)})):r.a.createElement("span",null)),r.a.createElement("span",{className:"runtime"},e.runtime,"min")))})))};var j=function(){Object(n.useEffect)((function(){fetch("favorites.json",{method:"get",headers:{"content-type":"text/csv;charset=UTF-8"}}).then((function(e){return e.json()})).then((function(e){return e.items.map((function(e){var t=e.watched,a=e.title,n=e.year,r=e.runtime,c=e.rating,l=e.tags,i=e.lbFilm,o=e.lbDiary,u=e.id,s=e.poster,d=(e.backdrop,e.directors);return{id:u,year:n,title:a,watched:t,rating:c,runtime:r,tags:l,picture:s?"".concat(m).concat(s):void 0,lbDiaryLink:o,lbFilmLink:i,directors:d}}))})).then(c).catch((function(e){return c([])}))}),[]);var e=Object(n.useState)([]),t=Object(i.a)(e,2),a=t[0],c=t[1],l=Object(n.useState)(!1),o=Object(i.a)(l,2),u=o[0],s=o[1];return r.a.createElement(f.Provider,{value:{movies:a,updateMovies:c,loading:u,setLoading:s}},r.a.createElement("div",{className:"App"},r.a.createElement(b,null),r.a.createElement(x,null)))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement("link",{href:"https://fonts.googleapis.com/css2?family=Montserrat&display=swap",rel:"stylesheet"}),r.a.createElement(j,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}],[[7,1,2]]]);
//# sourceMappingURL=main.add81131.chunk.js.map