import { useUiStore } from '@/stores/ui-store';

describe('UI store', () => {
  beforeEach(() => {
    useUiStore.setState({ selectedStopSeq: null, activeLogDay: 1 });
  });

  it('tracks the selected stop and active log day', () => {
    useUiStore.getState().selectStop(3);
    useUiStore.getState().setActiveLogDay(2);

    expect(useUiStore.getState()).toMatchObject({
      selectedStopSeq: 3,
      activeLogDay: 2,
    });
  });
});
