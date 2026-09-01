const players=[...window.FFL_PLAYERS];
const tbody=document.getElementById("leaderboardBody");
function leader(key){return [...players].sort((a,b)=>(b[key]||0)-(a[key]||0))[0]}
function cards(){
 [["pointsLeader","pointsLeaderValue","pts"],["goalLeader","goalLeaderValue","goals"],["assistLeader","assistLeaderValue","assists"],["potwLeader","potwLeaderValue","potw"],["totwLeader","totwLeaderValue","totw"]]
 .forEach(([n,v,k])=>{const p=leader(k);document.getElementById(n).textContent=p?.player||"—";document.getElementById(v).textContent=p?.[k]||0})
}
function render(q=""){
 const rows=players.filter(p=>p.player.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>(b.pts-a.pts)||(b.goals-a.goals)||(b.assists-a.assists));
 tbody.innerHTML=rows.map((p,i)=>`<tr><td>${i+1}</td><td>${p.player}</td><td>${p.wins||""}</td><td>${p.draws||""}</td><td>${p.pts||""}</td><td>${p.cs||""}</td><td>${p.goals||""}</td><td>${p.assists||""}</td><td>${p.totw||""}</td><td>${p.potw||""}</td><td>${p.y||""}</td><td>${p.r||""}</td></tr>`).join("")
}
document.getElementById("search").addEventListener("input",e=>render(e.target.value));
cards();render();
