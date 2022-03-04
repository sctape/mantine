import type {
  FormErrors,
  FormRulesRecord,
  FormRules,
  FormValidationResult,
  FormFieldValidationResult,
} from '../types';
import { isFormList } from '../form-list/form-list';
import { filterErrors } from '../filter-errors/filter-errors';
import { validateListValues } from './validate-list-values';

function validateRecordRules<T, K extends keyof T>(
  rules: FormRulesRecord<T, K>,
  values: T
): FormErrors {
  return Object.keys(rules).reduce<FormErrors>((acc, key) => {
    const rule = rules[key];

    if (isFormList(values[key])) {
      return { ...acc, ...validateListValues(values, key, rules) };
    }

    if (typeof rules[key] === 'function') {
      acc[key] = rule(values[key], values);
    }

    return acc;
  }, {});
}

function getValidationResults(errors: FormErrors) {
  const filteredErrors = filterErrors(errors);
  return { hasErrors: Object.keys(filteredErrors).length > 0, errors: filteredErrors };
}

export function validateValues<T, K extends keyof T>(
  rules: FormRules<T, K>,
  values: T
): FormValidationResult {
  if (rules === undefined || rules === null) {
    return { hasErrors: false, errors: {} };
  }

  if (typeof rules === 'function') {
    return getValidationResults(rules(values));
  }

  return getValidationResults(validateRecordRules(rules, values));
}

export function validateFieldValue<T, K extends keyof T>(
  field: K,
  rules: FormRules<T, K>,
  values: T
): FormFieldValidationResult {
  const results = validateValues(rules, values);
  const valid = !(field in results.errors);
  return { valid, error: valid ? null : results.errors[field] };
}
