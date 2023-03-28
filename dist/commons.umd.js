(function(d,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(d=typeof globalThis<"u"?globalThis:d||self,o(d.TmUsCommons={}))})(this,function(d){"use strict";var C=Object.defineProperty;var W=(d,o,h)=>o in d?C(d,o,{enumerable:!0,configurable:!0,writable:!0,value:h}):d[o]=h;var l=(d,o,h)=>(W(d,typeof o!="symbol"?o+"":o,h),h);const p=class{constructor(t){l(this,"name",p.Root);t!=null&&(this.name=t)}static getLogger(t){t==null&&(t=p.Root);let e=p.instances.get(t);return e||(console.info("正在创建logger: "+t),e=new p(t),p.instances.set(t,e)),e}debug(t,...e){this.print(console.debug,"DEBUG",t,...e)}info(t,...e){this.print(console.info,"INFO",t,...e)}trace(t,...e){this.print(console.trace,"TRACE",t,...e)}warn(t,...e){this.print(console.warn,"WARN",t,...e)}error(t,...e){this.print(console.error,"ERROR",t,...e)}print(t,e,n,...s){let i=`${new Date().toJSON()} [${e}] [${this.name}] ${n} `;s!=null&&s.length>0?t(i,...s):t(i)}};let o=p;l(o,"Root","ROOT"),l(o,"instances",new Map);let h=o.getLogger("config");const w=class{constructor(t=!1){l(this,"useLocalStorage");this.useLocalStorage=t}static getInstance(){return w.instance||(w.instance=new w),w.instance}listValues(){if(this.useLocalStorage){let e=[];for(let n=0;n<localStorage.length;n++){let s=localStorage.key(n);s!=null&&e.push(s)}return e}let t=GM_listValues();return h.debug("获取所有配置项名称: ",t),t}getValue(t,e){if(this.useLocalStorage){let s=localStorage.getItem(t);return s==null?e:JSON.parse(s)}let n=GM_getValue(t,e);return h.debug("获取配置项%s，结果: ",t,n),n}setValue(t,e){if(this.useLocalStorage){let n=JSON.stringify(e);localStorage.setItem(t,n);return}h.debug("设置配置项%s设置为: ",t,e),GM_setValue(t,e)}initValueIfNotExists(t,e){let n=this.getValue(t,null);n==null?(h.debug("配置项%s不存在，初始化为: ",t,e),this.setValue(t,e)):h.debug("配置项%s已存在，值为: ",t,n)}deleteValue(t){if(this.useLocalStorage){localStorage.removeItem(t);return}h.debug("删除配置项%s",t),GM_deleteValue(t)}listValuesAsync(){return GM.listValues()}getValueAsync(t,e){return GM.getValue(t,e)}setValueAsync(t,e){return GM.setValue(t,e)}deleteValueAsync(t){return GM.deleteValue(t)}};let k=w;l(k,"instance");let c=o.getLogger("websocket-client");class V{constructor(t,e=3e3,n=!0){l(this,"url","ws://127.0.0.1:8080/websocket");l(this,"connectTimeout");l(this,"connected");l(this,"webSocket");this.url=t,this.connectTimeout=e,this.connected=!1,n&&this.createWebSocket()}createWebSocket(){c.info("正在创建WebSocket");let t=new WebSocket(this.url);this.addWebSocketListeners(t),c.info("WebSocket创建成功：",t),this.webSocket=t}addWebSocketListeners(t){c.info("正在绑定WebSocket事件监听");let e=this;t.onopen=n=>{e.connected=!0,e.onOpen(n)},c.debug("open事件绑定完成"),t.onmessage=n=>{e.onMessage(n)},c.debug("message事件绑定完成"),t.onclose=n=>{e.connected=!1,e.onClose(n)},c.debug("close事件绑定完成"),t.onerror=n=>{e.connected=!1,e.onError(n)},c.debug("error事件绑定完成")}send(t){return this.webSocket==null?(c.error("WebSocket未创建"),!1):this.connected?(this.webSocket.send(t),!0):(c.error("未连接到WebSocket服务端"),!1)}waitForOpen(){let t=this;return new Promise((e,n)=>{let s=new Date().valueOf(),r=setInterval(()=>{let i=new Date().valueOf()-s;if(i>=this.connectTimeout){clearInterval(r),n(`WebSocket服务端${t.url}连接超时`);return}t.connected&&(clearInterval(r),e(i))},1)})}onOpen(t){c.info("websocket服务端连接成功: ",t)}onMessage(t){c.info("处理服务端发送报文事件: ",t)}onClose(t){c.info("与websocket服务端连接断开: ",t)}onError(t){c.info("websocket通信发生错误: ",t)}}class O{constructor(t,e,n){l(this,"jsonrpc");l(this,"method");l(this,"params");l(this,"id");this.jsonrpc="2.0",this.method=t,this.params=e,this.id=n}}let g=o.getLogger("jsonrpc-websocket-client");class M extends V{constructor(e,n="number",s=5e3,r=1){super(e);l(this,"msgIdType");l(this,"seq");l(this,"timeout");l(this,"interval");l(this,"requests");l(this,"responses");this.msgIdType=n,this.timeout=s,this.interval=r,this.seq=new Uint32Array(1),this.seq[0]=0,this.requests=new Map,this.responses=new Map}generateMsgId(){return this.msgIdType=="string"?crypto.randomUUID():Atomics.add(this.seq,0,1)}createRequestAndSend(e,n,s){s==null&&(s=this.generateMsgId());let r=new O(e,n,s);this.sendRequest(r)}sendRequest(e){if(e.id==null){g.warn("无效的JSON-RPC请求报文，缺少id字段: ",e);return}g.info("向%s发送请求报文：",this.url,e);let n=JSON.stringify(e);this.requests.set(e.id,e),super.send(n)}onMessage(e){let n=JSON.parse(e.data);if(n==null){g.warn(`接收到来自${e.origin}的报文，无法转换为JSON对象：${e.data}`);return}if(n.jsonrpc==null){g.warn("报文中未找到jsonrpc字段");return}if(n.jsonrpc!="2.0"){g.warn("JSON-RPC版本不为2.0");return}if(n.method!=null){this.handleRequest(n);return}if(n.id!=null){this.handleResponse(n);return}g.warn("接收到无法处理的报文：",n)}handleRequest(e){g.debug("接收到请求报文：",e)}handleResponse(e){g.debug("接收到响应报文：",e),this.responses.set(e.id,e)}waitForResponse(e,n,s){let r=new Date().valueOf(),i=setInterval(()=>{let a=new Date().valueOf()-r;if(a>=this.timeout){clearInterval(i),g.error("获取响应报文超时"),n("获取响应报文超时");return}if(this.responses.has(e)){clearInterval(i);let u=this.responses.get(e);if(u!=null&&u.result!=null){g.debug(`获取到请求${e}的响应报文，耗时${a}ms`),s(u);return}g.error("抽取响应报文失败: ",u),n("抽取响应报文失败")}},this.interval)}}let T={url:"ws://127.0.0.1:6800/jsonrpc",msgIdType:"number",token:null,timeout:3e4,interval:10};class j extends M{constructor(e){let n={...T,...e};super(n.url,n.msgIdType,n.timeout,n.interval);l(this,"token");l(this,"eventTarget");l(this,"on",this.addEventListener);this.token=n.token,this.eventTarget=new EventTarget}addEventListener(e,n,s){this.eventTarget.addEventListener(e,n,s)}getSecret(){return this.token!=null&&this.token.trim()!=""?`token:${this.token}`:null}reconnect(e,n){e!=null&&(this.url=e),n!=null&&(this.token=n),this.createWebSocket()}generateParams(){let e=[],n=this.getSecret();return n!=null&&e.push(n),e}handleRequest(e){super.handleRequest(e);let n=null,s=null;switch(e.method){case"onDownloadStart":s="downloadStart",n=e.params[0].gid;break;case"onDownloadPause":s="downloadPause",n=e.params[0].gid;break;case"onDownloadStop":s="downloadStop",n=e.params[0].gid;break;case"onDownloadComplete":s="downloadComplete",n=e.params[0].gid;break;case"onDownloadError":s="downloadError",n=e.params[0].gid;break}if(s!=null&&n!=null){let r=new CustomEvent(s,{detail:n});this.eventTarget.dispatchEvent(r)}}getVersion(){let e="aria2.getVersion",n=this.generateParams(),s=this.generateMsgId();this.createRequestAndSend(e,n,s);let r=this;return new Promise((i,a)=>{r.waitForResponse(s,a,u=>{let f=u.result;i(f)})})}addUri(e,n={},s){let r="aria2.addUri",i=this.generateParams();i.push(e),n!=null&&i.push(n),s!=null&&i.push(s);let a=this.generateMsgId();this.createRequestAndSend(r,i,a);let u=this;return new Promise((f,b)=>{u.waitForResponse(a,b,$=>{let D=$.result;f(D)})})}tellStatus(e,n=["gid","status","totalLength","completedLength"]){let s="aria2.tellStatus",r=this.generateParams();r.push(e),n!=null&&r.push(n);let i=this.generateMsgId();this.createRequestAndSend(s,r);let a=this;return new Promise((u,f)=>{a.waitForResponse(i,f,b=>{let $=b.result;u($)})})}}class L{constructor(t,e,n=null){l(this,"id");l(this,"uri");l(this,"fileName");l(this,"msgId",null);l(this,"gid",null);l(this,"status",null);l(this,"totalLength",null);l(this,"completedLength",0);this.id=t,this.uri=e,this.fileName=n}}class N{constructor(t,e,n=null,s=null){l(this,"id");l(this,"name");l(this,"dir");l(this,"proxy");this.id=t,this.name=e,this.dir=n,this.proxy=s}}let E=o.getLogger("download-mgr");class A{constructor(t,e){l(this,"aria2");this.aria2=new j({url:t,msgTypeId:"string",token:e,timeout:1e4,interval:1})}download(t,e){let n=[e.uri],s={};t.dir!=null&&(s.dir=t.dir),e.fileName!=null&&(s.out=e.fileName),t.proxy!=null&&(s["all-proxy"]=t.proxy),this.aria2.addUri(n,s).then(r=>{E.info(`下载任务 ${e.id} 已创建，gid为 ${r}`)})}}let S=o.getLogger("dynamic-injector");const v=class{constructor(t,e,n){l(this,"cdn","https://cdn.jsdelivr.net/npm/");l(this,"timeout",5e3);l(this,"checkInterval",1);S=new o("dynamic-injector"),t!=null&&(this.cdn=t),e!=null&&(this.timeout=e),n!=null&&(this.checkInterval=n)}static getInstance(){return v.instance||(S.info("创建DynamicInjector实例"),v.instance=new v),v.instance}getExtName(t){let e=new URL(t),n=e.pathname.lastIndexOf(".");return e.pathname.substring(n)}injectByUrl(t,e,n){let s=this.getExtName(t);if(s==".js"){let r=document.createElement("script");r.type="application/javascript",r.src=t,document.body.appendChild(r),S.info(`开始注入js: ${t}`)}else if(s==".css"){let r=document.createElement("link");r.rel="stylesheet",r.href=t,document.head.appendChild(r),S.info(`开始注入css: ${t}`)}else S.info(`无法注入元素的文件类型: ${s}`);return new Promise((r,i)=>{if(n==null)return;let a=new Date().valueOf(),u=setInterval(()=>{let f=new Date().valueOf()-a;if(f>=e){clearInterval(u),i(`${t}加载超时`);return}let b=n(f);if(b!=null){clearInterval(u),r(b);return}},this.checkInterval)})}injectFromCDN(t,e,n,s,r,i){let a=`${t}${e}@${n}${s}`;return this.injectByUrl(a,r,i)}inject(t,e,n,s){return this.injectFromCDN(this.cdn,t,e,n,this.timeout,s)}};let I=v;l(I,"instance");let R={mountPointId:"app",html:null,styles:"",vueVersion:"3.2",elementVersion:"2.3",vueOptions:{},provides:{},plugins:[]},y=o.getLogger("vue-app-loader");class P{constructor(t){l(this,"injector");l(this,"options");this.injector=I.getInstance(),this.options={...R,...t}}async load(t){let e=t!=null?{...R,...t}:this.options,n=document.createElement("div");e.html!=null&&e.html.trim().length>0?n.outerHTML=e.html.trim():n.id=e.mountPointId,document.body.appendChild(n),e.styles!=null&&GM_addStyle(e.styles);do{if(e.vueVersion==null)break;let s=await this.injector.inject("vue",e.vueVersion,"/dist/vue.global.js",a=>{if(typeof Vue<"u"){let u=Vue;return y.info(`Vue ${u.version} 加载完成，耗时 ${a} ms`),u}return null});if(s==null||e.elementVersion==null)break;let r=await this.injector.inject("element-plus",e.elementVersion,"/dist/index.full.js",a=>{if(typeof ElementPlus<"u"){let u=ElementPlus;return y.info(`Element Plus ${u.version} 加载完成，耗时 ${a} ms`),u}return null});this.injector.inject("element-plus",e.elementVersion,"/dist/index.css");let i=s.createApp(e.vueOptions);r!=null&&(i.use(r),i.provide("$message",r.ElMessage));for(let a of e.plugins)i.use(a);for(let a in e.provides)if(a.startsWith("$")){let u=e.provides[a];y.info("正在注入provide：%s = ",a,u),i.provide(a,u)}return i.mount(`#${e.mountPointId}`),i}while(!1);return null}}d.Aria2Client=j,d.Config=k,d.DownloadManager=A,d.DynamicInjector=I,d.Logger=o,d.Task=L,d.TaskGroup=N,d.VueAppLoader=P,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=commons.umd.js.map
