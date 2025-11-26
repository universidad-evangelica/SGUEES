export interface IResult {
	ErrorCode: number;
  ErrorMessage: string;
  ErrorSource: string;
  Result: boolean;
  CodeHelper: any;
  RowsAffected: number;
  Data: any;
}
