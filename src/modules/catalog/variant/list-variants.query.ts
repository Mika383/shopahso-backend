export type AttributeFilterOperator = 'eq' | 'gte' | 'lte' | 'gt' | 'lt';

export type ParsedAttributeFilter = {
  code: string;
  operator: AttributeFilterOperator;
  value: string;
};

export type ListVariantsQuery = {
  categoryId?: string;
  brandId?: string;
  priceMin?: string;
  priceMax?: string;
  limit?: string;
  attrFilters: ParsedAttributeFilter[];
};
