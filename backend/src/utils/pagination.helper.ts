export interface PaginationResult {
  totalPage: number;
  totalRecord: number;
  limitItems: number;
  skip: number;
}

export const pagination = async (model: any, find: any, req: any): Promise<PaginationResult> => {
  const limitItems = 2;
  let page = 1;
  if (req.query?.page) {
    page = parseInt(req.query.page as string, 10);
  }

  const totalRecord = await model.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;

  return {
    totalPage,
    totalRecord,
    limitItems,
    skip,
  };
};
