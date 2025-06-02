import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import BuyHainInterface from './buyHain';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Hain Token App</title>
        <meta
          content="Buy your hain token and join the Hain community"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.buyHainWrapper}>
        <BuyHainInterface />
      </main>
    </div>
  );
};

export default Home;
