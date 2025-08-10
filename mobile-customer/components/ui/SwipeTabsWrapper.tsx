import React, { useRef } from 'react';
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState, ViewProps } from 'react-native';

type Props = ViewProps & {
  onNext: () => void;
  onPrev: () => void;
  // If provided, swipes that start at or below this Y (screen coordinates) won't be captured
  excludeFromY?: number;
  // Thresholds
  dxThreshold?: number; // default 24
  vxThreshold?: number; // default 0.3
};

export function SwipeTabsWrapper({
  onNext,
  onPrev,
  excludeFromY,
  dxThreshold = 24,
  vxThreshold = 0.3,
  style,
  children,
  ...rest
}: Props) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const { dx, dy } = gesture;
        const y = (evt.nativeEvent as any).pageY ?? 0;
        if (excludeFromY !== undefined && y >= excludeFromY - 8) return false;
        return Math.abs(dx) > dxThreshold && Math.abs(dx) > Math.abs(dy) + 8;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (_evt, gesture) => {
        const { dx, vx } = gesture;
        if (dx <= -dxThreshold * 1.666 || vx <= -vxThreshold) onNext();
        else if (dx >= dxThreshold * 1.666 || vx >= vxThreshold) onPrev();
      },
    })
  ).current;

  return (
    <View {...panResponder.panHandlers} style={style} {...rest}>
      {children}
    </View>
  );
}

export default SwipeTabsWrapper;
