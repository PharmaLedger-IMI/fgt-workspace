import type { ComponentInterface } from '@stencil/core';
import { getElement } from '@stencil/core';

export default function HostElement() {
  return (proto: ComponentInterface, name: string) => {
    const { componentWillLoad } = proto;

    proto.componentWillLoad = function () {
      this[name] = getElement(this);
      return componentWillLoad?.call(this);
    };
  };
}
