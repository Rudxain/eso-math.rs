//scan[0, 1] are the initial coordinates, scan[2, 3] are the end coords (x0, y0, x1, y1).
//step is the "resolution". smaller = higher detail.
//pix is the charset for approximation intensity levels, in "little-endian" order.
function plot(xprA=`x`, xprB=`y`, scan=[-6, 4, 6, -4], step=1/8, pix=' +#')
{return eval(`var out='';
    for (let y = ${scan[1]}; y >= ${scan[3]}; y -= ${step})
    {
        for (let x = ${scan[0]}; x <= ${scan[2]}; x += ${step})
        {out += ((((${xprB}) + ${step/2} > (${xprA}) && (${xprB}) - ${step/2} < (${xprA})) ? "${pix[2]}" : ((${xprB}) + ${step} > (${xprA}) && (${xprB}) - ${step} < (${xprA})) ? "${pix[1]}" : "${pix[0]}") + (x < ${scan[2]} ? "" : "\\n"))}
    }
    out`)
}
//eval() is wrapping everything because evaling each expression in a loop has horrible performance
