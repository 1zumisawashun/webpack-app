// Component Class
// Angulerとかでは見かけられるクラスっぽい
// 直接インスタンス化されるべきではないので＞常に継承して使われるのでabstractクラスで登録する
// abstractにすることでインスタンスかできなくなる
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId: string //任意のパラメータは最後に置く必要がある
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    // templateElement.contentでchildrenを取得することができる
    // 第二引数でディープクローンするか選択する（children以下の階層のNodeも取得するか）
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  // abstractメソッドは具体的な実装はありません。代わりにこのクラスを継承したクラスで、このメソッドを実装して
  // 利用可能にすることを強制します＞具体的な実装内容は継承先のクラスでおこなう
  abstract configure(): void;
  abstract renderContent(): void;
  // ここからコンストラクタの中の要素は取得することができない
  // 第一引数はどこに入れるか（インサートするか）
  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
}
