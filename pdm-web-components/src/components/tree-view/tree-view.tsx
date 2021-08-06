import {Component, h, Host, Prop} from '@stencil/core';

@Component({
  tag: 'tree-view',
  styleUrl: 'tree-view.css',
  shadow: false,
})
export class TreeView {
  @Prop() objectTree: object = {
    header: {},
    footer: {},
    body: {}
  };

  private renderHeader() {
    return(
      <div class="traceability__top">
        <div class="traceability__top-group">
          <h3 class="traceability__top-title">{this.objectTree['header'].title}</h3>
          <p class="traceability__top-subtitle">{this.objectTree['header'].subtitle}</p>
        </div>
        <div class="traceability__top-box" data-title={this.objectTree['header'].description}>
          <div class="traceability__top-pin"></div>
        </div>
      </div>
    )
  }

  private renderFooter() {
    return(
      <div class="traceability__bottom">
        <div class="traceability__middle-box-all track" data-title={this.objectTree['footer'].description}>
          <div class="traceability__middle-box">
            <div class="traceability__middle-box-img"></div>
          </div>
        </div>
        <div class="traceability__bottom-group">
          <h3 class="traceability__bottom-title">{this.objectTree['footer'].title}</h3>
          <p class="traceability__bottom-subtitle">{this.objectTree['footer'].subtitle}</p>
        </div>
      </div>
    )
  }

  private nodeTree(nodes)
  {
    let line = 0;
    return (
      nodes ?
      nodes.map((node) => {
        let j = 0;

        let nodeBoxes = `<div class="traceability__middle-boxes"><span class="traceability__middle-boxes-line"></span>` +

          node.map((nodeX) => {
            let item = (j === 0 ? `<div class="traceability__middle-boxes-items" data-boxes-line="${line}">` : '') +

              `
              <div class="traceability__middle-box-all" data-box-id="${nodeX.id}" data-parent-id="${nodeX.parentId ? nodeX.parentId.toString() : ''}" data-parent-line="${line}" data-title="${nodeX.title ? nodeX.title : ''}" onclick="trackBox(this)">
                <div class="traceability__middle-box">
                  <div class="traceability__middle-box-img"></div>
                </div>
              </div>
              ` +

              (j === (node.length - 1) ? '</div>' : '');

            j++;

            return item;
          }).join('\n') +

          '<span class="traceability__middle-boxes-line"></span></div>';

        line++;

        return nodeBoxes;
      }).join('\n')
        : ''
    );
  }

  render() {
    return (
      <Host>
        <div class="traceability">
          <div class="traceability__container">
            {this.objectTree['header'] ? this.renderHeader() : ''}
            <div class="traceability__middle" innerHTML={this.nodeTree(this.objectTree['body'])} />
            {this.objectTree['footer'] ? this.renderFooter() : ''}
          </div>
        </div>
      </Host>
    );
  }

}


   
