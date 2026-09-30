// ============================================================
// Acompanhamento Comercial - Filial RN (51) - LÓGICA E LAYOUT
// Não é preciso mexer neste arquivo para atualizar os dados.
// Use o botão "Atualizar base" na tela para carregar os .xlsx.
// Sem upload ainda, usa o exemplo embutido em data.js.
// ============================================================
let {P,I}=DATA;
const FER=["2026-09-07"]; // feriados conhecidos (formato AAAA-MM-DD) - vale para qualquer mês/ano dos dados
let S={pg:"geral",sub:"ar",ln:null};

const $=id=>document.getElementById(id);
const f=n=>n.toLocaleString("pt-BR",{maximumFractionDigits:0});
const pc=n=>(n*100).toFixed(0)+"%";

// Calendário calculado a partir dos próprios dados (dia mais comum do mês/ano define du/dc/rest)
function calendario(){
  if(!P.length) return {du:0,dc:0,rest:0};
  const dias=P.map(p=>p[0]);
  const maxDia=Math.max(...dias);
  // usa o ano/mês guardados em DATA.ym se existir (vindo do upload), senão assume set/2026
  const [ano,mes]=(window.__YM)||[2026,9];
  const diasNoMes=new Date(ano,mes,0).getDate();
  let du=0,dc=0;
  for(let i=1;i<=diasNoMes;i++){
    const d=new Date(Date.UTC(ano,mes-1,i)),w=d.getUTCDay();
    if(w>0&&w<6&&!FER.includes(d.toISOString().slice(0,10))){du++;if(i<maxDia)dc++}
  }
  return {du,dc,rest:du-dc};
}
let {du,dc,rest}=calendario();

const day=id=>+$(id).value.slice(8,10);
const NAV=[["geral","Análise Geral","◉"],["top","Top 10","▲"],["det","Detalhamento","▦"]];
const LN=[["Comercial",0],["Industrial (bloco de espuma)",1]];

function sel(){
  const a=day("d1"),b=day("d2");
  return P.filter(p=>p[0]>=a&&p[0]<=b&&(S.ln===null||p[4]===S.ln));
}

const rk=(rows,head,fmt)=>{
  const mx=Math.max(1,...rows.map(r=>r[1]));
  return `<table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}<th style="width:30%"></th></tr></thead>
  <tbody>${rows.map((r,i)=>`<tr>${fmt(r,i)}<td><span class="bar" style="width:${r[1]/mx*100}%"></span></td></tr>`).join("")}</tbody></table>`;
};

function R(){
  $("nav").innerHTML=NAV.map(([k,t,i])=>`<button class="nv ${S.pg==k?"on":""}" onclick="S.pg='${k}';R()">${i} ${t}</button>`).join("");
  $("li").innerHTML=LN.map(([t,v])=>`<button class="ln ${S.ln===v?"on":""}" onclick="S.ln=S.ln===${v}?null:${v};R()">${t}</button>`).join("");

  const F=sel(), K=F.filter(p=>p[2]!==0), Lf=S.ln!==null;
  let h="";
  $("sb").textContent={geral:"Filial RN · Empresa 51 · Visão geral",top:"Análise detalhada · Filial RN (51)",det:"Pedidos da Filial RN (51)"}[S.pg]+(Lf?" · "+LN[S.ln][0]:"");

  if(S.pg=="geral"){
    const by={};
    K.forEach(p=>by[p[1]]=(by[p[1]]||0)+p[3]);
    const rows=Object.entries(by).map(([k,r])=>{
      const proj=dc?r/dc*du:0;
      return {k,r,proj,n:K.filter(p=>p[1]===k).length};
    }).sort((a,b)=>b.r-a.r);

    const totR=rows.reduce((s,x)=>s+x.r,0);
    const totProj=dc?totR/dc*du:0;
    const Q=new Set(K.map(p=>p[2])).size;
    const tk=Q?totR/Q:0;

    const kp=[["Realizado",f(totR),"#0b3d91"],["Projeção",f(totProj),"#2bd17e"],["Qtd Pedidos",f(Q),"#d81b8c"],["Ticket Médio",f(tk),"#f28c4b"]];

    const tr=x=>`<td>${x.n}</td><td>${f(x.r)}</td><td>${f(x.proj)}</td>`;

    h=`<div class="card k">${kp.map(([a,b,c])=>`<div style="--c:${c}"><small>${a}</small><p>${b}</p></div>`).join("")}</div>
    <div class="card sc"><table><thead><tr><th>Vendedor</th><th>Pedidos</th><th>Realizado</th><th>Projeção</th></tr></thead>
    <tbody>${rows.map(x=>`<tr><td>${x.k}</td>${tr(x)}</tr>`).join("")}</tbody>
    <tfoot><tr><td>TOTAL RN</td>${tr({n:Q,r:totR,proj:totProj})}</tr></tfoot></table></div>`;

  }else if(S.pg=="top"){
    const nu=new Set(F.map(p=>p[7])), ip=I.filter(i=>nu.has(i[0]));
    const tabs=[["ar","Aprovado x Recusado"],["cl","Top 10 Clientes"],["pr","Top 10 Produtos"]];
    h=`<div class="tb">${tabs.map(([k,t])=>`<button class="${S.sub==k?"on":""}" onclick="S.sub='${k}';R()">${t}</button>`).join("")}</div><div class="card sc">`;

    if(S.sub=="ar"){
      const N={A:"Aprovado",R:"Recusado",P:"Pendente",N:"Sem análise"},a={};
      F.forEach(p=>{a[p[5]]=a[p[5]]||[0,0];a[p[5]][0]++;a[p[5]][1]+=p[3]});
      const tt=F.reduce((s,p)=>s+p[3],0)||1;
      const rows=Object.keys(N).filter(k=>a[k]).map(k=>[N[k],a[k][1],a[k][0],k]);
      h+=rk(rows,["Análise financeira","R$ Pedidos","Qtd","% valor"],
        r=>`<td>${r[0]}</td><td>${f(r[1])}</td><td>${r[2]}</td><td style="color:${r[3]=="R"?"var(--r)":r[3]=="A"?"var(--g)":""}">${pc(r[1]/tt)}</td>`);
    }else if(S.sub=="cl"){
      const c={};F.forEach(p=>{c[p[6]]=c[p[6]]||[0,0];c[p[6]][0]+=p[3];c[p[6]][1]++});
      const rows=Object.entries(c).map(([k,v])=>[k,v[0],v[1]]).sort((a,b)=>b[1]-a[1]).slice(0,10);
      h+=rk(rows,["#","Cliente","R$ Pedidos","Pedidos"],(r,i)=>`<td>${i+1}</td><td style="text-align:left">${r[0]}</td><td>${f(r[1])}</td><td>${r[2]}</td>`);
    }else{
      const c={};ip.forEach(i=>{const k=i[1]+"|"+i[2];c[k]=c[k]||[0,0];c[k][0]+=i[4];c[k][1]+=i[3]});
      const rows=Object.entries(c).map(([k,v])=>[k.split("|"),v[0],v[1]]).sort((a,b)=>b[1]-a[1]).slice(0,10);
      h+=rk(rows,["Cod Prod","Descrição Produto","R$ Vendido","Qtd"],
        r=>`<td>${r[0][0]}</td><td style="text-align:left">${r[0][1]}</td><td>${f(r[1])}</td><td>${r[2]}</td>`);
    }
    h+="</div>";
  }else{
    h=`<div class="card sc"><table><thead><tr><th>Dia</th><th style="text-align:left">Cliente</th><th style="text-align:left">Vendedor</th><th>Nota</th><th>Linha</th><th>Análise</th><th>R$</th></tr></thead>
    <tbody>${F.sort((a,b)=>a[0]-b[0]).map(p=>`<tr><td>${p[0]}/09</td><td style="text-align:left;font-weight:400">${p[6]}</td><td style="text-align:left;font-weight:400">${p[1]}</td><td>${p[2]||"–"}</td><td>${p[4]?"Industrial":"Comercial"}</td><td>${{A:"Aprovado",R:"Recusado",P:"Pendente",N:"–"}[p[5]]}</td><td>${f(p[3])}</td></tr>`).join("")}</tbody></table></div>`;
  }
  $("pg").innerHTML=h;
  $("n").textContent=`Realizado considera pedidos com nº de nota (Região 3). Top 10 e Aprovado x Recusado consideram todos os pedidos do período, inclusive sem nota. Industrial = operação "Bloco e Lam de Espuma". Dias úteis ${du}, decorridos ${dc}, restantes ${rest}.`;
}
$("d1").onchange=$("d2").onchange=R;

// ============================================================
// Carregar base de dados direto dos arquivos .xlsx exportados
// (Vendas_Set.xlsx e Tabelas_Itens_Vendidos.xlsx), sem precisar
// pedir para ninguém converter nada. Fica salvo no navegador.
// ============================================================
const OPS=["PEDIDO DE VENDA","PEDIDO DE VENDA - BLOCO E LAM DE ESPUMA","PEDIDO DE VENDA - ENTREGA FUTURA","PEDIDO DE VENDA -ANTECIPAÇÃO"];
const SM={LIBERADO:"A",RECUSADO:"R",PENDENTE:"P"};

function parseVendas(rows){
  const d=rows.filter(r=>r["Empresa"]==51 && OPS.includes(r["Descrição (Tipo de Operação)"]));
  const Pn=d.map(r=>{
    const dt=r["Dt. Neg."];
    const day=dt instanceof Date? dt.getDate():null;
    const ym=dt instanceof Date? [dt.getFullYear(),dt.getMonth()+1]:null;
    return {row:[day,r["Apelido (Vendedor)"],Math.trunc(r["Nro. Nota"]||0),+(+r["Vlr. Nota"]).toFixed(2),r["Descrição (Tipo de Operação)"].includes("BLOCO")?1:0,SM[r["Análise Financeira"]]||"N",String(r["Nome Parceiro (Parceiro)"]||"").trim(),Math.trunc(r["Nro. Único"])],ym};
  });
  return Pn;
}
function parseItens(rows,nuset){
  return rows.filter(r=>nuset.has(Math.trunc(r.NUNOTA))).map(r=>[Math.trunc(r.NUNOTA),Math.trunc(r.CODPROD),r.DESCRPROD,+r.QTDNEG,+(+r.VLRTOT).toFixed(2)]);
}

function salvar(novo){
  try{localStorage.setItem("rn51_data",JSON.stringify(novo));}catch(e){console.warn("Não foi possível salvar no navegador:",e);}
}
function carregarSalvo(){
  try{const s=localStorage.getItem("rn51_data");if(s)return JSON.parse(s);}catch(e){}
  return null;
}

async function processarArquivos(fileList){
  const st=$("upst");
  st.textContent="Lendo arquivos...";
  let vendasRows=null, itensRows=null;
  for(const file of fileList){
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:"array",cellDates:true});
    const ws=wb.Sheets[wb.SheetNames.find(n=>wb.Sheets[n]["!ref"])||wb.SheetNames[0]];
    // tenta como Vendas (com 2 linhas de cabeçalho extra) e como Itens (sem)
    const asVendas=XLSX.utils.sheet_to_json(ws,{range:2,defval:null});
    const asItens=XLSX.utils.sheet_to_json(ws,{defval:null});
    if(asVendas[0]&&"Nro. Único" in asVendas[0]) vendasRows=asVendas;
    else if(asItens[0]&&"NUNOTA" in asItens[0]) itensRows=asItens;
  }
  if(!vendasRows){st.textContent="Não encontrei o arquivo de Vendas (Vendas_Set.xlsx) entre os selecionados.";return;}
  const parsed=parseVendas(vendasRows);
  const P2=parsed.map(x=>x.row);
  const ymCount={};parsed.forEach(x=>{if(x.ym){const k=x.ym.join("-");ymCount[k]=(ymCount[k]||0)+1;}});
  const ym=Object.entries(ymCount).sort((a,b)=>b[1]-a[1])[0];
  const YM=ym?ym[0].split("-").map(Number):[2026,9];
  let I2=[];
  if(itensRows){const nuset=new Set(P2.map(p=>p[7]));I2=parseItens(itensRows,nuset);}
  const novo={P:P2,I:I2,ym:YM};
  salvar(novo);
  aplicarDados(novo);
  st.textContent=`Base atualizada: ${P2.length} pedidos${itensRows?`, ${I2.length} itens`:" (sem arquivo de itens - Top 10 Produtos ficará vazio)"}.`;
}

function aplicarDados(d){
  P=d.P;I=d.I||[];window.__YM=d.ym||[2026,9];
  const c=calendario();du=c.du;dc=c.dc;rest=c.rest;
  const dmin=new Date(Date.UTC(window.__YM[0],window.__YM[1]-1,1)).toISOString().slice(0,10);
  const dmax=new Date(Date.UTC(window.__YM[0],window.__YM[1]-1,new Date(window.__YM[0],window.__YM[1],0).getDate())).toISOString().slice(0,10);
  $("d1").min=dmin;$("d1").max=dmax;$("d2").min=dmin;$("d2").max=dmax;
  $("d1").value=dmin;
  const maxDia=Math.max(...P.map(p=>p[0]));
  $("d2").value=new Date(Date.UTC(window.__YM[0],window.__YM[1]-1,maxDia)).toISOString().slice(0,10);
  R();
}

$("upfile").addEventListener("change",e=>{if(e.target.files.length)processarArquivos(e.target.files);});
const salvo=carregarSalvo();
if(salvo){aplicarDados(salvo);$("upst").textContent=`Base carregada do navegador (${salvo.P.length} pedidos).`;}
else R();