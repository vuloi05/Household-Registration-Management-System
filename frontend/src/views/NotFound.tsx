import React from 'react';
import { Helmet } from 'react-helmet';
import './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container1">
      <Helmet>
        <title>404 - Not Found</title>
        <meta name="description" content="The page you requested was not found on InfoFuturist." />
      </Helmet>
      <h3 className="not-found-text1">OOPS! PAGE NOT FOUND</h3>
      <div className="not-found-container2">
        <h1 className="not-found-text2">404</h1>
      </div>
      <div className="not-found-container3">
        <h2 className="not-found-text3">
          WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT FOUND
        </h2>
      </div>
    </div>
  );
};

export default NotFound;