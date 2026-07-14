'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BirthInfo } from '@/lib/ziwei/types';
import { SHICHEN } from '@/lib/ziwei/constants';
import { PROVINCES } from '@/lib/ziwei/cities';
import { birthDateToSolarDate, isValidSolarDate, type CalendarType } from '@/lib/ziwei/birth-date';

export interface BirthFormState {
  name: string;
  calendar: CalendarType;
  isLeapMonth: boolean;
  year: string;
  month: string;
  day: string;
  clockHour: string;
  clockMinute: string;
  unknownTime: boolean;
  province: string;
  city: string;
  longitude: number;
  gender: 'male' | 'female';
}

interface BirthFormProps {
  onSubmit: (info: BirthInfo) => void;
  loading?: boolean;
  initialData?: Partial<BirthFormState>;
  onFormSave?: (data: BirthFormState) => void;
  hideSubmit?: boolean;
  compact?: boolean;
  frame?: boolean;
  title?: string;
  submitLabel?: string;
}

const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (longitude - 120) * 4;
  const solar = ((clockMins + offset) % 1440 + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

export default function BirthForm({
  onSubmit,
  loading,
  initialData,
  onFormSave,
  hideSubmit,
  compact,
  frame = true,
  title = '输入生辰八字',
  submitLabel = '立即起盘',
}: BirthFormProps) {
  const [form, setForm] = useState<BirthFormState>({
    name: initialData?.name ?? '',
    calendar: initialData?.calendar ?? 'solar',
    isLeapMonth: initialData?.isLeapMonth ?? false,
    year: initialData?.year ?? '',
    month: initialData?.month ?? '',
    day: initialData?.day ?? '',
    clockHour: initialData?.clockHour ?? '8',
    clockMinute: initialData?.clockMinute ?? '0',
    unknownTime: initialData?.unknownTime ?? false,
    province: initialData?.province ?? '',
    city: initialData?.city ?? '',
    longitude: initialData?.longitude ?? 120,
    gender: initialData?.gender ?? 'male',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    onFormSave?.({ ...form });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const cityList = useMemo(() => {
    const prov = PROVINCES.find(p => p.name === form.province);
    return prov ? prov.cities : [];
  }, [form.province]);

  const branch = useMemo(() => {
    if (form.unknownTime) return 0;
    return calcTrueSolarBranch(
      parseInt(form.clockHour) || 0,
      parseInt(form.clockMinute) || 0,
      form.longitude,
    );
  }, [form.clockHour, form.clockMinute, form.longitude, form.unknownTime]);

  const y = parseInt(form.year) || 0;
  const m = parseInt(form.month) || 0;
  const d = parseInt(form.day) || 0;
  const solarDate = birthDateToSolarDate(form);
  const offsetMin = Math.round((form.longitude - 120) * 4);
  const shichenInfo = SHICHEN[branch];

  const errors = {
    year: !form.year ? '请选择出生年份' : y < 1900 || y > 2026 ? '年份范围：1900-2026' : '',
    month: !form.month ? '请选择月份' : '',
    day: !form.day
      ? '请选择日期'
      : form.calendar === 'solar' && form.year && form.month && !isValidSolarDate(y, m, d)
        ? `${m}月没有${d}日`
        : form.calendar === 'lunar' && form.year && form.month && !solarDate
          ? '农历日期不存在'
          : '',
    location: !form.province || !form.city ? '请选择出生地点' : '',
  };
  const hasError = Object.values(errors).some(Boolean);

  const steps = [
    !!form.year && !!form.month && !!form.day && !errors.year && !errors.month && !errors.day,
    form.unknownTime || (!!form.clockHour && !!form.clockMinute),
    !!form.province && !!form.city,
    !!form.gender,
  ];
  const showSummary = steps[0] && steps[1] && !errors.year && !errors.month && !errors.day;
  const summaryText = [
    steps[0] ? `${y}年${m}月${d}日` : '',
    form.city || form.province,
    form.unknownTime ? '时辰不详' : `${SHICHEN_NAMES[branch]}时`,
    form.gender === 'male' ? '男' : '女',
  ].filter(Boolean).join(' · ');

  const showErr = (field: keyof typeof errors) => touched[field] || submitAttempted;

  const handleProvince = (prov: string) => {
    const provData = PROVINCES.find(p => p.name === prov);
    const firstCity = provData?.cities[0];
    setForm({
      ...form,
      province: prov,
      city: firstCity?.name || '',
      longitude: firstCity?.longitude ?? 120,
    });
    setTouched(t => ({ ...t, location: true }));
  };

  const handleCity = (cityName: string) => {
    const prov = PROVINCES.find(p => p.name === form.province);
    const cityData = prov?.cities.find(c => c.name === cityName);
    setForm({ ...form, city: cityName, longitude: cityData?.longitude ?? 120 });
    setTouched(t => ({ ...t, location: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ year: true, month: true, day: true, location: true });
    if (hasError) return;
    onFormSave?.({ ...form });
    const finalDate = birthDateToSolarDate(form);
    if (!finalDate) return;
    onSubmit({
      year: finalDate.year,
      month: finalDate.month,
      day: finalDate.day,
      hour: branch,
      gender: form.gender,
      name: form.name || undefined,
      province: form.province || undefined,
      city: form.city || undefined,
      longitude: form.longitude,
    });
  };

  const content = (
    <>
      <div className="white-form-title">
        <span />
        <strong>{title}</strong>
        <span />
      </div>

      <div className="white-progress" aria-hidden="true">
        {steps.map((done, index) => (
          <i key={index} className={done ? 'is-done' : ''} />
        ))}
      </div>

      <div className="white-field">
        <label>姓名（可选）</label>
        <input
          className="white-input"
          type="text"
          placeholder="请输入姓名"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="white-field">
        <div className="white-field-row">
          <label>出生日期（{form.calendar === 'lunar' ? '农历' : '公历'}）</label>
          <div className="white-calendar-toggle" aria-label="历法">
            <button
              type="button"
              className={form.calendar === 'solar' ? 'is-active' : ''}
              onClick={() => setForm({ ...form, calendar: 'solar', isLeapMonth: false })}
            >
              公历
            </button>
            <button
              type="button"
              className={form.calendar === 'lunar' ? 'is-active' : ''}
              onClick={() => setForm({ ...form, calendar: 'lunar' })}
            >
              农历
            </button>
          </div>
        </div>
        {form.calendar === 'lunar' && (
          <label className="white-checkbox">
            <input
              type="checkbox"
              checked={form.isLeapMonth}
              onChange={e => setForm({ ...form, isLeapMonth: e.target.checked })}
            />
            <span>闰月</span>
          </label>
        )}
        <div className="white-grid white-grid-3">
          <div>
            <select
              className={`white-select ${showErr('year') && errors.year ? 'has-error' : ''}`}
              value={form.year}
              onChange={e => { setForm({ ...form, year: e.target.value }); setTouched(t => ({ ...t, year: true })); }}
              required
            >
              <option value="">年份</option>
              {Array.from({ length: 127 }, (_, i) => 2026 - i).map(yr => (
                <option key={yr} value={String(yr)}>{yr}</option>
              ))}
            </select>
            {showErr('year') && errors.year && <p className="white-error">{errors.year}</p>}
          </div>
          <div>
            <select
              className={`white-select ${showErr('month') && errors.month ? 'has-error' : ''}`}
              value={form.month}
              onChange={e => { setForm({ ...form, month: e.target.value }); setTouched(t => ({ ...t, month: true })); }}
              required
            >
              <option value="">月份</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={String(month)}>{month} 月</option>
              ))}
            </select>
            {showErr('month') && errors.month && <p className="white-error">{errors.month}</p>}
          </div>
          <div>
            <select
              className={`white-select ${showErr('day') && errors.day ? 'has-error' : ''}`}
              value={form.day}
              onChange={e => { setForm({ ...form, day: e.target.value }); setTouched(t => ({ ...t, day: true })); }}
              required
            >
              <option value="">日期</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={String(day)}>{day} 日</option>
              ))}
            </select>
            {showErr('day') && errors.day && <p className="white-error">{errors.day}</p>}
          </div>
        </div>
      </div>

      <div className="white-field">
        <label>出生时间（北京时间）</label>
        <div className={`white-time-panel ${form.unknownTime ? 'is-muted' : ''}`}>
          <div className="white-grid white-grid-2">
            <select
              className="white-select"
              value={form.clockHour}
              disabled={form.unknownTime}
              onChange={e => setForm({ ...form, clockHour: e.target.value })}
            >
              {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                <option key={hour} value={String(hour)}>{hour.toString().padStart(2, '0')} 时</option>
              ))}
            </select>
            <select
              className="white-select"
              value={form.clockMinute}
              disabled={form.unknownTime}
              onChange={e => setForm({ ...form, clockMinute: e.target.value })}
            >
              {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                <option key={minute} value={String(minute)}>{minute.toString().padStart(2, '0')} 分</option>
              ))}
            </select>
          </div>
          <p className="white-solar-time">
            真太阳时 <span>→</span> <strong>{SHICHEN_NAMES[branch]}时</strong>
            {shichenInfo && <em>（{shichenInfo.range}）</em>}
          </p>
        </div>
        <label className="white-checkbox">
          <input
            type="checkbox"
            checked={form.unknownTime}
            onChange={e => setForm({ ...form, unknownTime: e.target.checked })}
          />
          <span>不知道出生时间，以子时（23:00-01:00）起盘</span>
        </label>
      </div>

      <div className="white-field">
        <label>出生地点（用于真太阳时校正）</label>
        <div className="white-grid white-grid-2">
          <select
            className={`white-select ${showErr('location') && errors.location ? 'has-error' : ''}`}
            value={form.province}
            onChange={e => handleProvince(e.target.value)}
          >
            <option value="">省份 / 直辖市</option>
            {PROVINCES.map(province => (
              <option key={province.name} value={province.name}>{province.name}</option>
            ))}
          </select>
          <select
            className={`white-select ${showErr('location') && errors.location ? 'has-error' : ''}`}
            value={form.city}
            onChange={e => handleCity(e.target.value)}
            disabled={!form.province}
          >
            <option value="">{form.province ? '城市' : '先选省份'}</option>
            {cityList.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
        {form.province && (
          <p className="white-field-hint">
            {form.city || '请选择城市'} · 经度 {form.longitude.toFixed(1)}E · 时差 {offsetMin > 0 ? '+' : ''}{offsetMin} 分钟
          </p>
        )}
        {showErr('location') && errors.location && <p className="white-error">{errors.location}</p>}
      </div>

      <div className="white-field">
        <label>性别</label>
        <div className="white-segmented">
          <button
            type="button"
            className={form.gender === 'male' ? 'is-active' : ''}
            onClick={() => setForm({ ...form, gender: 'male' })}
          >
            男
          </button>
          <button
            type="button"
            className={form.gender === 'female' ? 'is-active' : ''}
            onClick={() => setForm({ ...form, gender: 'female' })}
          >
            女
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="white-summary">
          <span>已确认</span>
          <strong>{summaryText}</strong>
        </div>
      )}

      {!hideSubmit && (
        <button
          className={`white-submit ${loading ? 'is-loading' : ''}`}
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? '紫微起盘中...' : submitLabel}
        </button>
      )}
    </>
  );

  return (
    <form
      className={[
        frame ? 'white-form-card' : 'white-form-plain',
        compact ? 'is-compact' : '',
      ].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
    >
      {content}
    </form>
  );
}
