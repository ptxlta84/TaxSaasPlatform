import { z } from 'zod';

export const incomeSchema = z.object({
  salary: z.object({
    gross: z.number().min(0, { message: 'Gross salary cannot be negative' }),
    net: z.number().min(0, { message: 'Net salary cannot be negative' })
  }),
  otherSources: z.number().min(0, { message: 'Income cannot be negative' }),
  houseProperty: z.number().min(0, { message: 'Income cannot be negative' })
});

export const deductionsSchema = z.object({
  section80C: z.number()
    .min(0, { message: 'Cannot be negative' })
    .max(150000, { message: 'Maximum limit is ₹1,50,000' }),
  section80D: z.number()
    .min(0, { message: 'Cannot be negative' })
    .max(100000, { message: 'Maximum limit is ₹1,00,000' }), // Assuming senior citizen max
  hra: z.number().min(0),
  section80G: z.number().min(0),
  section80E: z.number().min(0),
  other: z.number().min(0)
});
