function graph(xpr0=`x`, xpr1=`y`, x0=-6, y0=4, x1=6, y1=-4, step=1/8){
var dict = {xpr0:xpr0, xpr1:xpr1, x0:x0, y0:y0, x1:x1, y1:y1, step:step}, code = `var x=x0, y=y0, out=[];
while (y > y1){
   if (x >= x1) {y -= step};
   if (x < x1) {x += step} else {x = x0}
   out.push(\`\${((xpr1) + step/2 > xpr0 && (xpr1) - step/2 < (xpr0)) ? "#" : ((xpr1) + step > xpr0 && (xpr1) - step < (xpr0)) ? "+" : " "}\${(x < x1) ? "" : "\\n"}\`);
};
out.join("")`.replace(/xpr0|xpr1|x0|y0|x1|y1|step/g, function(match){return dict[match]});
return eval(code)
}