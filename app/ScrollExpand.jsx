'use client';

import { useLocale } from './locale';
import Iridescence from './Iridescence';

// Conceptual illustration, not a representation of a client's property.
export default function ScrollExpand() {
  const { t } = useLocale();
  return <section className="architecture-section" aria-labelledby="expand-title">
    <Iridescence color={[0.08, 0.22, 0.15]} mouseReact={false} amplitude={0.04} speed={0.25} />
    <div className="architecture-section__inner page-width">
      <div className="architecture-section__copy">
        <p className="eyebrow">{t.expand.eyebrow}</p>
        <h2 id="expand-title">{t.expand.title}</h2>
        <p>{t.expand.detail}</p>
      </div>
      <figure className="apartment-model" data-reveal>
        <svg viewBox="0 0 760 620" aria-hidden="true" focusable="false">
          <defs>
            <pattern id="floor-grain" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M0 0V26" stroke="#b6b09d" strokeWidth=".7" opacity=".3" /></pattern>
            <pattern id="bath-tile" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#e4e3d7" /></pattern>
          </defs>
          <g className="apartment-model__plan">
            <path d="M68 67H702V549H444V579H68Z" fill="#0f1e17" opacity=".26" transform="translate(10 17)" />
            <path d="M60 56H692V540H432V570H60Z" fill="#c5c5ae" />
            <path d="M72 68H680V528H420V558H72Z" fill="#e6dfcc" />
            <path d="M72 68H680V528H420V558H72Z" fill="url(#floor-grain)" />
            <g className="apartment-model__room">
              <path d="M442 70H678V264H442Z" fill="#a6b09b" />
              <path d="M442 70H678V264H442Z" fill="url(#bath-tile)" />
              <rect x="553" y="87" width="102" height="57" rx="16" fill="#f4f1e6" stroke="#72856b" />
              <rect x="563" y="96" width="82" height="37" rx="14" fill="#d9dfd0" />
              <circle cx="634" cy="114" r="3" fill="#839078" />
              <rect x="459" y="89" width="57" height="48" fill="#7f8b71" /><ellipse cx="487" cy="111" rx="19" ry="13" fill="#eeede1" />
              <rect x="611" y="178" width="44" height="58" rx="19" fill="#ececde" stroke="#89957e" /><path d="M611 187H655" stroke="#89957e" />
            </g>
            <g className="apartment-model__room">
              <rect x="442" y="280" width="236" height="246" fill="#d4d2bd" />
              <rect x="477" y="322" width="169" height="169" fill="#c0c1a9" />
              <rect x="506" y="308" width="112" height="158" rx="3" fill="#eeebdf" stroke="#9caa90" /><rect x="506" y="308" width="112" height="15" fill="#7c896d" />
              <rect x="515" y="327" width="41" height="28" rx="5" fill="#faf7ec" stroke="#d5d2c2" /><rect x="567" y="327" width="41" height="28" rx="5" fill="#faf7ec" stroke="#d5d2c2" />
              <path d="M507 371H617V420H507Z" fill="#a0ac94" /><path d="M507 420H617" stroke="#76846d" strokeWidth="2" />
              <rect x="464" y="309" width="29" height="29" fill="#8d9278" /><rect x="631" y="309" width="29" height="29" fill="#8d9278" />
              <rect x="460" y="501" width="204" height="25" fill="#a3a98e" /><path d="M511 501V526M562 501V526M613 501V526" stroke="#7c866b" />
            </g>
            <g className="apartment-model__room">
              <path d="M88 86H410V132H132V218H88Z" fill="#899478" />
              <path d="M140 88V130M198 88V130M268 88V130M337 88V130M90 153H130" stroke="#63755c" />
              <rect x="207" y="96" width="50" height="27" rx="4" fill="#c9cfbb" stroke="#61775e" /><path d="M234 94V103" stroke="#4a6551" strokeWidth="3" />
              <rect x="347" y="93" width="49" height="31" fill="#4c5c47" /><g fill="none" stroke="#bcc4b2"><circle cx="358" cy="102" r="6" /><circle cx="383" cy="113" r="7" /></g>
              <rect x="213" y="191" width="145" height="70" rx="34" fill="#a19a7b" stroke="#817f64" />
              <g fill="#5f735d" stroke="#415b4b"><rect x="235" y="171" width="33" height="17" rx="7" /><rect x="294" y="171" width="33" height="17" rx="7" /><rect x="235" y="264" width="33" height="17" rx="7" /><rect x="294" y="264" width="33" height="17" rx="7" /></g>
              <ellipse cx="285" cy="225" rx="12" ry="8" fill="#d9d4bd" />
            </g>
            <g className="apartment-model__room">
              <rect x="104" y="332" width="280" height="181" rx="2" fill="#c5c9b3" /><path d="M114 342H374V503H114Z" fill="none" stroke="#b4baa3" />
              <rect x="99" y="342" width="66" height="152" rx="9" fill="#77886f" stroke="#536b56" /><rect x="102" y="350" width="13" height="135" rx="5" fill="#647d63" />
              <path d="M118 352H155V411H118ZM118 419H155V483H118Z" fill="#8a9a7d" stroke="#6b8167" />
              <ellipse cx="233" cy="416" rx="47" ry="35" fill="#aca98b" stroke="#85866b" /><ellipse cx="233" cy="416" rx="11" ry="8" fill="#d9d9c5" />
              <rect x="325" y="365" width="49" height="53" rx="12" fill="#89967c" stroke="#657b61" /><path d="M334 368V406H371" fill="none" stroke="#afbaa0" strokeWidth="7" />
              <rect x="411" y="438" width="14" height="76" fill="#889075" /><circle cx="395" cy="320" r="17" fill="#748a69" /><path d="M385 312L404 330M396 305L390 331" stroke="#a6b59a" fill="none" />
            </g>
            <g className="apartment-model__walls" fill="none" stroke="#f7f3e6" strokeWidth="12" strokeLinejoin="miter"><path d="M252 562H66V62H686V534H438V566H324M436 68V196M436 255V363M436 417V534M440 272H684" /></g>
            <g fill="none" stroke="#8c9980" strokeWidth="2"><path d="M437 196H491A55 55 0 0 1 437 251M437 363H491A54 54 0 0 1 437 417M252 563V492A72 72 0 0 1 324 564" /><path d="M126 63H339M127 57V69M338 57V69M686 337V466M680 338H692M680 465H692M66 342V471M60 343H72M60 470H72" strokeWidth="5" /></g>
          </g>
        </svg>
        <figcaption><span aria-hidden="true" />{t.expand.planCaption}</figcaption>
      </figure>
    </div>
  </section>;
}
