'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ThemeSelect } from '@/components/ui/theme-select';

interface StatusFilterProps {
  paramName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function StatusFilter({ paramName = 'status', options, placeholder = 'All Status' }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentValue = searchParams.get(paramName) || 'all';

  const handleChange = (e: { target: { value: string } }) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value && e.target.value !== 'all') {
      params.set(paramName, e.target.value);
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const allOptions = [
    { value: 'all', label: placeholder },
    ...options
  ];

  return (
    <ThemeSelect
      name={paramName}
      value={currentValue}
      onChange={handleChange as any}
      options={allOptions}
      className="h-10 w-full sm:w-44 bg-white rounded-xl border-gray-200 shadow-sm text-sm cursor-pointer"
    />
  );
}
