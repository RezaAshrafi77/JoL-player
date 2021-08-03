import React, { memo, useRef, useState, useEffect, useMemo } from 'react';
import Controller from './controller';
import { videoparameter } from '@/interface';
import { FlowContext, useVideoFlow } from '@/core/context';
import useMandatoryUpdate from '@/utils/useMandatoryUpdate';
import Broadcast from '@/components/svgIcon';
// import videoUrl from '@/assets/haiwang.mp4';
import '@/assets/css/reset.scss';
import './index.scss';

const Index = memo(function Index({
  videoSrc = 'https://gs-files.oss-cn-hongkong.aliyuncs.com/okr/test/file/2021/07/01/haiwang.mp4',
}: {
  videoSrc?: string;
}) {
  /**
   * @description 关灯对象
   */
  const lightOffMaskRef = useRef<HTMLDivElement>(null!);
  /**
   * @description 视频对象
   */
  const videoRef = useRef<HTMLVideoElement>(null!);
  /**
   * @description 视频容器对象
   */
  const videoContainerRef = useRef<HTMLElement>(null!);
  /**
   * @description 定时器检测 3 秒后视频是否可用
   */
  const timerToCheckVideoUseful = useRef<NodeJS.Timeout | null>(null);
  /**
   * @description 视频是否可播发的开关
   */
  const [isVideoUseful, setIsVideoUseful] = useState<boolean>(true);
  /**
   * @description 视频缓存的开关
   */
  const [isBufferring, setIsBufferring] = useState<boolean>(false);

  const { videoFlow, dispatch } = useVideoFlow();

  const forceUpdate = useMandatoryUpdate();

  const waitingListener = () => {
    setIsBufferring(true);
  };

  const playingListener = () => {
    setIsBufferring(false);
  };

  useEffect(() => {
    /**
     * @description 设置用户给的视频播放器长宽
     */
    const videoContainerElem = videoContainerRef.current;
    const videoElem = videoRef.current;
    // 设置定时器检测 3 秒后视频是否可用
    timerToCheckVideoUseful.current = setTimeout(() => {
      // 当视频未初始化时（即不可用时）
      if (videoElem.networkState === 0) {
        console.log('can not find');
        setIsVideoUseful(false);
      } else {
        clearTimeout(timerToCheckVideoUseful.current!);
      }
    }, 3000);
    // 监听是否在缓冲
    videoElem.addEventListener('waiting', waitingListener);
    // 当开始播放时更改waiting状态
    videoElem.addEventListener('playing', playingListener);
    /**
     * @description 强制更新dom层
     */
    forceUpdate();
    return () => {
      timerToCheckVideoUseful.current && clearTimeout(timerToCheckVideoUseful.current);
      videoElem.removeEventListener('waiting', waitingListener);
      videoElem.removeEventListener('playing', playingListener);
    };
  }, []);

  const returnVideoSource = useMemo(() => {
    return (
      <>
        <source src={videoSrc} type="video/mp4" />
        <source src={videoSrc} type="video/ogg" />
        <source src={videoSrc} type="video/webm" />
      </>
    );
  }, [videoSrc]);

  const contextProps = useMemo(() => {
    return Object.assign(
      {},
      {
        videoRef: videoRef.current,
        videoContainerRef: videoContainerRef.current,
        lightOffMaskRef: lightOffMaskRef.current,
        dispatch,
        videoFlow,
      },
    );
  }, [videoRef.current, videoFlow]);

  return (
    <figure className="JoL-player-container" ref={videoContainerRef}>
      <div className="light-off-mask" ref={lightOffMaskRef}></div>
      <video className="JoL-player" ref={videoRef}>
        {returnVideoSource}
      </video>
      {!isVideoUseful && <p className="video-no-useful-tip">抱歉！视频找不到了 (｡ ́︿ ̀｡)</p>}
      {isBufferring && (
        <Broadcast iconClass="loading" fill="#ff0000" className="player-loading" fontSize="55px" />
      )}
      <FlowContext.Provider value={contextProps}>
        <Controller />
      </FlowContext.Provider>
    </figure>
  );
});

export default Index;
