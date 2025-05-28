import { Request, Response, NextFunction } from 'express';

const BLACKLIST =
  /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC(UTE)?|MERGE|GRANT|REVOKE|TRUNCATE|DECLARE|CAST|CONVERT|UNION|WHERE|LIKE|HAVING|INTO|ISNULL|NVARCHAR|@@|CHAR|NCHAR|ASCII|SLEEP|BENCHMARK|http|https|www|ftp|file|data:|on\w+=|<script|<iframe|<svg|<math|<embed|<video|<source|<body|<base|<form|<object|<applet|<frame|<frameset|<layer|<link|<style|<meta|vbscript:|<!--/i;


const TAUTOLOGY_REGEX = /(['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i;

const isTautology = (input: string): boolean => {
    return TAUTOLOGY_REGEX.test(input);
};

const sanitizeAndValidate = (input: any): string | any | false => {
    if (typeof input === 'string') {
        let sanitizedInput = input.trim();

        if (BLACKLIST.test(sanitizedInput) || isTautology(sanitizedInput)) {
        return false;
        }

        sanitizedInput = sanitizedInput
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

        return sanitizedInput;
    }

    return input;
};

const sanitizeObject = (obj: Record<string, any>): Record<string, any> | false => {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
        const sanitized = sanitizeObject(obj[key]);
        if (sanitized === false) return false;
        obj[key] = sanitized;
        } else {
        const sanitized = sanitizeAndValidate(obj[key]);
        if (sanitized === false) return false;
        obj[key] = sanitized;
        }
    }
    return obj;
};

const sanitizeAndValidateInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
    const sanitizedBody = sanitizeObject(req.body);
    if (sanitizedBody === false) {
        res.status(400).json({ error: 'Invalid input detected' });
        return;
    }

    req.body = sanitizedBody;
    next();
};

export default sanitizeAndValidateInput;
