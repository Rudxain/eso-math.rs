/*
scan[0, 1] are the initial coordinates, scan[2, 3] are the end coords (x0, y0, x1, y1).
step is the "resolution". smaller = higher detail.
pix is the charset for approximation intensity levels, in "little-endian" order.
*/
function plot(xprA = 'x', xprB = 'y', scan = [-6, 4, 6, -4], step = 1 / 8, pix = ' +#')
{
   'use strict';
   xprA = '('+ xprA +')'; xprB = '('+ xprB +')';
   scan = scan.map(x => Number(x) || 0); step = Number(step) || 1;
   pix = Array.isArray(pix) ? pix.join('') : String(pix);
   return Function(`const {scan, step, pix} = this; let out = '';
      for (let y = scan[1]; y >= scan[3]; y -= step)
         for (let x = scan[0]; x <= scan[2]; x += step)
            out += pix[(${xprB} + step > ${xprA} && ${xprB} - step < ${xprA}) + (${xprB} + step / 2 > ${xprA} && ${xprB} - step / 2 < ${xprA})] + (x < scan[2] ? '' : '\\n');
      return out`).call({scan, step, pix})
}
