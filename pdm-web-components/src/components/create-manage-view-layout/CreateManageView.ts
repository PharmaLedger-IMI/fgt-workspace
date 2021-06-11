export default interface CreateManageView {
  componentWillLoad(): void;

  isCreate(): boolean;

  load(): void;
  create(evt): void;

  refresh(newVal?, oldVal?): void;

  navigateBack(evt): void;
  getCreate();
  getPostCreate();
  getManage();
  getView();

  render(): void;
}
