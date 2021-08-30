export default interface CreateManageView {
  componentWillLoad(): void;

  isCreate(): boolean;

  load(): void;
  create(evt): void;
  reset(): void;

  refresh(newVal?, oldVal?): void;

  getCreate();
  getPostCreate();
  getManage();
  getView();

  render(): void;
}
