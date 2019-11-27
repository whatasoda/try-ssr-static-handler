import React, { FC, useMemo, useEffect, useRef, useState } from 'react';

const ATTRIBUTE = 'data-static-handler' as const;
type AttributeKeyType = typeof ATTRIBUTE;
interface GeneralAttributes extends Omit<React.DOMAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML'> {}
interface StaticHandlerInjection extends GeneralAttributes {
  'data-static-handler': string;
}

type AnyHandlerEntry = HandlerEntry<any>;
interface HandlerEntry<P extends object> {
  name: string;
  factory: (props: P) => StaticHandlerInjection;
}

type GeneralEventHandler = React.EventHandler<React.SyntheticEvent>;

export const createStaticHandler = <T extends keyof GeneralAttributes, P extends object>(
  name: string,
  factory: (props: P) => Required<Pick<GeneralAttributes, T>>,
): HandlerEntry<P> => ({
  name,
  factory: (props: P) => {
    const injection = { ...factory(props), [ATTRIBUTE]: Attr.stringify({ name, props }) };
    return injection as Required<Pick<StaticHandlerInjection, T | AttributeKeyType>>;
  },
});

interface AttrObject {
  name: string;
  props: object;
}
const Attr = {
  stringify: ({ name, props }: AttrObject) => JSON.stringify({ name, props }),
  parse: (str: string | null) => (str ? (JSON.parse(str) as AttrObject) : null),
};

interface StaticHandlerProviderProps {
  entries: AnyHandlerEntry[];
  enable: boolean;
}

const StaticHandlerProvider: FC<StaticHandlerProviderProps> = ({ enable, ...props }) => {
  return useMemo(() => {
    return enable ? <StaticHandlerProviderComponent {...props} /> : <div>{props.children}</div>;
  }, [enable]);
};

const StaticHandlerProviderComponent: FC<Omit<StaticHandlerProviderProps, 'enable'>> = ({ entries, children }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [handlerTypes, setHandlerTypes] = useState<(keyof GeneralAttributes)[]>([]);
  const [runners, setRunners] = useState<JSX.Element[]>([]);

  const { dispatch, injectionMaps, runnerComponentMap } = useMemo(() => {
    const runnerComponentMap = entries.reduce<Record<string, RunnerComponentType<any>>>((acc, curr) => {
      acc[curr.name] = createRunnerComponent(curr);
      return acc;
    }, {});

    const injectionMaps: Record<string, Map<HTMLElement, GeneralEventHandler>> = {};
    const dispatch = ({ elem, injection: { [ATTRIBUTE]: _, ...injection } }: HandlerFragment) => {
      const newTypes: (keyof GeneralAttributes)[] = [];
      Object.entries(injection).forEach(([type, handler]) => {
        if (!(type in injectionMaps)) {
          injectionMaps[type] = new Map();
          newTypes.push(type as keyof GeneralAttributes);
        }
        injectionMaps[type].set(elem, handler);
      });
      setHandlerTypes((curr) => [...curr, ...newTypes]);
    };

    return { dispatch, injectionMaps, runnerComponentMap };
  }, []);

  useEffect(() => {
    const elems = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(`[${ATTRIBUTE}]`) ?? []);
    const runners = elems.reduce<JSX.Element[]>((acc, elem, i) => {
      const attr = Attr.parse(elem.getAttribute(ATTRIBUTE));
      if (attr) {
        const { name, props } = attr;
        const Runner = runnerComponentMap[attr.name];
        const key = `${name}-${i}`;
        acc.push(<Runner {...{ key, dispatch, elem, props }} />);
      }
      return acc;
    }, []);
    setRunners(runners);
  }, []);

  const rootInjection = useMemo(() => {
    return handlerTypes.reduce<GeneralAttributes>((acc, type) => {
      const injectionMap = injectionMaps[type];
      // TODO: set `currentTarget` and `target` correctly
      const handler: React.EventHandler<React.SyntheticEvent> = (event) => {
        const path = event.nativeEvent.composedPath() as HTMLElement[];
        const topIndex = path.indexOf(rootRef.current!);
        if (topIndex === -1) return;
        path.slice(0, topIndex).forEach((elem) => injectionMap.get(elem)?.(event));
      };
      acc[type] = handler;
      return acc;
    }, {});
  }, [handlerTypes]);

  return (
    <div {...rootInjection} ref={rootRef}>
      {children}
      <>{runners}</>
    </div>
  );
};

interface HandlerFragment {
  injection: StaticHandlerInjection;
  elem: HTMLElement;
}

interface RunnerProps<P extends object> {
  props: P;
  elem: HTMLElement;
  dispatch: React.Dispatch<HandlerFragment>;
}
interface RunnerComponentType<P extends object> {
  (props: RunnerProps<P>): JSX.Element;
}
const createRunnerComponent = <P extends object>({ factory }: HandlerEntry<P>): RunnerComponentType<P> => {
  return ({ props, elem, dispatch }) => {
    const injection = factory(props);
    useEffect(() => {
      dispatch({ injection, elem });
    }, [injection]);
    return <></>;
  };
};

export default StaticHandlerProvider;
