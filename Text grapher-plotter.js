//x0 and y0 are the initial scan coordinates. x1 and y1 are the end coords.
//step is the "resolution". smaller = higher detail.
function graph(xpr0=`x`, xpr1=`y`, x0=-6, y0=4, x1=6, y1=-4, step=1/8){
return eval(`var x = ${x0}, y = ${y0}, out=[];
while (y > ${y1}){
   if (x >= ${x1}) {y -= ${step}};
   if (x < ${x1}) {x += ${step}} else {x = ${x0}}
   out.push(\`\${((${xpr1}) + ${step}/2 > ${xpr0} && (${xpr1}) - ${step}/2 < (${xpr0})) ? "#" : ((${xpr1}) + ${step} > ${xpr0} && (${xpr1}) - ${step} < (${xpr0})) ? "+" : " "}\${(x < ${x1}) ? "" : "\\n"}\`);
}; out.join("")`)}
