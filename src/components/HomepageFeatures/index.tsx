import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Comprehensive Requirements',
    Svg: require('@site/static/img/requirements-illustration.svg').default,
    description: (
      <>
        Detailed requirements engineering documentation covering functional and 
        non-functional requirements, use cases, and user stories for a complete 
        car rental management system.
      </>
    ),
  },
  {
    title: 'Workflow Analysis',
    Svg: require('@site/static/img/workflows-illustration.svg').default,
    description: (
      <>
        In-depth analysis of core rental workflows including vehicle search, 
        booking, payment processing, pickup, and return processes with detailed 
        sequence diagrams.
      </>
    ),
  },
  {
    title: 'Competitive Analysis',
    Svg: require('@site/static/img/analysis-illustration.svg').default,
    description: (
      <>
        Comprehensive analysis of existing car rental platforms including BookCars, 
        FreeCar, and Car Rental PHP, with insights on architecture patterns and 
        best practices.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
