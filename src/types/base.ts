export type Coding = {
  system: string;
  code: string;
  display?: string;
};

export type Period = {
  start?: string;
  end?: string;
};

export type CodableConcept = {
  coding?: Coding[];
  text?: string;
};

export type HcxError = {
  code: CodableConcept;
  expression?: string;
};