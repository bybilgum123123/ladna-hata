'use client';

import { useState } from 'react';
import { contactPhone, messengerChannels, whatsappRequestUrl } from './contact-config';
import { useLocale } from './locale';

export default function ContactRequest() {
  const { t } = useLocale();
  const f = t.form;
  const [requestKind, setRequestKind] = useState('estimate');
  const [objectType, setObjectType] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [copying, setCopying] = useState(false);
  const [channelNotice, setChannelNotice] = useState('');

  async function copyContactNumber() {
    try {
      await navigator.clipboard.writeText(contactPhone.international);
      setChannelNotice(f.copiedNumber);
    } catch {
      setChannelNotice(`${f.manualNumber} ${contactPhone.international}`);
    }
  }

  async function prepareRequest(event) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value;
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors = {};
    const areaValue = area.trim().replace(',', '.');
    const phoneValue = phone.replace(/[\s()-]/g, '');

    if (requestKind === 'estimate' && !objectType) nextErrors.objectType = f.errorObject;
    if (requestKind === 'estimate' && areaValue && (!/^\d+(\.\d{1,2})?$/.test(areaValue) || Number(areaValue) <= 0)) {
      nextErrors.area = f.errorArea;
    }
    if (requestKind === 'callback' && !/^(?:\+380|0)\d{9}$/.test(phoneValue)) {
      nextErrors.phone = f.errorPhone;
    }

    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length) {
      const firstInvalidField = ['objectType', 'area', 'phone'].find((field) => nextErrors[field]);
      requestAnimationFrame(() => form.elements.namedItem(firstInvalidField)?.focus());
      return;
    }

    const name = String(data.get('name') || '').trim();
    const comment = String(data.get('comment') || '').trim();
    const message = [
      requestKind === 'callback' ? f.messageCallback : f.messageEstimate,
      requestKind === 'estimate' && `${f.messageObject}: ${(objectType === 'apartment' ? f.apartment : f.cottage).toLowerCase()}.`,
      requestKind === 'estimate' && areaValue && `${f.messageArea}: ${areaValue} м².`,
      requestKind === 'callback' && `${f.messagePhone}: ${phoneValue}.`,
      name && `${f.messageName}: ${name}.`,
      comment && `${f.messageComment}: ${comment}`,
    ].filter(Boolean).join('\n');

    if (action === 'whatsapp') {
      window.location.assign(whatsappRequestUrl(message));
      return;
    }

    setCopying(true);
    try {
      await navigator.clipboard.writeText(message);
      setNotice(f.copiedText);
    } catch {
      setNotice(f.copyFailed);
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="contact-request">
      <p className="contact-request__intro">{f.intro}</p>
      <form className="contact-form" noValidate onSubmit={prepareRequest}>
        <fieldset className="contact-form__kind">
          <legend>{f.interest}</legend>
          <label><input type="radio" name="requestKind" value="estimate" checked={requestKind === 'estimate'} onChange={() => { setRequestKind('estimate'); setErrors({}); setNotice(''); }} /> {f.estimate}</label>
          <label><input type="radio" name="requestKind" value="callback" checked={requestKind === 'callback'} onChange={() => { setRequestKind('callback'); setErrors({}); setNotice(''); }} /> {f.callback}</label>
        </fieldset>
        <label className="contact-form__field">
          <span>{f.name} <small>{f.optional}</small></span>
          <input name="name" type="text" autoComplete="name" maxLength={80} placeholder={f.namePlaceholder} />
        </label>
        {requestKind === 'estimate' && <label className="contact-form__field">
          <span>{f.object} <b aria-hidden="true">*</b></span>
          <select
            name="objectType"
            value={objectType}
            onChange={(event) => {
              setObjectType(event.target.value);
              setErrors((current) => ({ ...current, objectType: '' }));
            }}
            aria-invalid={Boolean(errors.objectType)}
            aria-describedby={errors.objectType ? 'object-type-error' : undefined}
          >
            <option value="">{f.choose}</option>
            <option value="apartment">{f.apartment}</option>
            <option value="cottage">{f.cottage}</option>
          </select>
          {errors.objectType && <small className="contact-form__error" id="object-type-error">{errors.objectType}</small>}
        </label>}
        {requestKind === 'callback' && <label className="contact-form__field">
          <span>{f.phone} <b aria-hidden="true">*</b></span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((current) => ({ ...current, phone: '' }));
            }}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            placeholder="098 123 45 67"
          />
          {errors.phone && <small className="contact-form__error" id="phone-error">{errors.phone}</small>}
        </label>}
        {requestKind === 'estimate' && <label className="contact-form__field">
          <span>{f.area} <small>{f.optional}</small></span>
          <input
            name="area"
            type="text"
            inputMode="decimal"
            value={area}
            onChange={(event) => {
              setArea(event.target.value);
              setErrors((current) => ({ ...current, area: '' }));
            }}
            aria-invalid={Boolean(errors.area)}
            aria-describedby={errors.area ? 'area-error' : undefined}
            placeholder={f.areaPlaceholder}
          />
          {errors.area && <small className="contact-form__error" id="area-error">{errors.area}</small>}
        </label>}
        <label className="contact-form__field contact-form__field--wide">
          <span>{f.comment} <small>{f.optional}</small></span>
          <textarea name="comment" rows="3" maxLength={1000} placeholder={f.commentPlaceholder}></textarea>
        </label>
        <div className="contact-form__actions">
          <button className="button button--primary" type="submit" value="whatsapp" disabled={copying}>{f.openWhatsApp} <span aria-hidden="true">↗</span></button>
          <button className="button button--light" type="submit" value="copy" disabled={copying}>{f.copy}</button>
        </div>
        <p className="contact-form__hint">{f.hint}</p>
        <p className="contact-form__notice" role="status" aria-live="polite">{notice}</p>
      </form>
      <div className="contact-channels" aria-label={f.channels}>
        <a href={`tel:${contactPhone.international}`}>{f.call}: {contactPhone.display}</a>
        {messengerChannels.map((channel) => (
          <a key={channel.name} href={channel.href} onClick={channel.name === 'Viber' ? () => setChannelNotice(f.viberFallback) : undefined}>{channel.name}</a>
        ))}
        <button type="button" onClick={copyContactNumber}>{f.copyNumber} {contactPhone.international}</button>
      </div>
      <p className="contact-channels__notice" role="status" aria-live="polite">{channelNotice}</p>
    </div>
  );
}
