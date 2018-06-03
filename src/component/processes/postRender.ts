import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PostRender {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postRender;

    const viewport = scroller.viewport;
    const direction = scroller.state.direction;
    const items = scroller.state.fetch[direction].items;
    const position = viewport.scrollPosition;

    PostRender.processFetchedItems(items);

    if (position !== viewport.scrollPosition) {
      viewport.scrollPosition = position;
      viewport.syntheticScrollPosition = position;
    }

    const height = Math.round(
      Math.abs(items[0].getEdge(Direction.backward) - items[items.length - 1].getEdge(Direction.forward))
    );
    let syntheticScrollPosition = null;
    if (direction === Direction.forward) {
      PostRender.runForward(scroller, height);
    } else {
      syntheticScrollPosition = PostRender.runBackward(scroller, height);
    }

    if (position !== viewport.scrollPosition) {
      if (syntheticScrollPosition !== null) {
        viewport.scrollPosition += viewport.scrollPosition - syntheticScrollPosition;
      } else {
        viewport.scrollPosition = position;
      }
      viewport.syntheticScrollPosition = viewport.scrollPosition;
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.postRender,
      status: 'next'
    });
  }

  static processFetchedItems(items) {
    for (let i = items.length - 1; i >= 0; i--) {
      const element = items[i].element;
      element.style.left = '';
      element.style.position = '';
      items[i].invisible = false;
    }
  }

  static runForward(scroller: Scroller, size: number) {
    const paddingForward = scroller.viewport.padding[Direction.forward];
    const _paddingSize = paddingForward.size || 0;
    paddingForward.size = Math.max(_paddingSize - size, 0);
  }

  static runBackward(scroller: Scroller, size: number) {
    const viewport = scroller.viewport;
    const _scrollPosition = viewport.scrollPosition;
    const paddingBackward = viewport.padding[Direction.backward];
    const paddingForward = viewport.padding[Direction.forward];

    // need to make "size" pixels in backward direction
    // 1) via paddingTop
    const _paddingSize = paddingBackward.size || 0;
    let paddingSize = Math.max(_paddingSize - size, 0);
    paddingBackward.size = paddingSize;
    const paddingDiff = size - (_paddingSize - paddingSize);
    // 2) via scrollTop
    if (paddingDiff > 0) {
      size = paddingDiff;
      viewport.scrollPosition += size;
      const diff = size - viewport.scrollPosition - _scrollPosition;
      if (diff > 0) {
        paddingSize = paddingForward.size || 0;
        paddingForward.size = paddingSize + diff;
        viewport.scrollPosition += diff;
      }
      viewport.syntheticScrollPosition = viewport.scrollPosition;
      return viewport.syntheticScrollPosition;
    }
    return null;
  }

}
