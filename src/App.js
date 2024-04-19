// App.js

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import IssueDetail from './IssueDetail'; // IssueDetail 컴포넌트를 임포트

import { marked } from 'marked'; // Markdown 파서
import DOMPurify from 'dompurify'; // HTML 살균

const App = () => {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get('https://api.github.com/repos/angular/angular-cli/issues', {
          params: {
            state: 'open',
            sort: 'comments',
            direction: 'desc',
            page: page,
            per_page: 20
          }
        });
        setIssues(prev => [...prev, ...response.data]);
        setHasMore(response.data.length > 0);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    if (hasMore) {
      fetchIssues();
    }
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, {
      threshold: 0.5
    });

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => observer && observer.disconnect();
  }, [loader, hasMore]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('ko-KR');
    return formattedDate;
  };

  return (
    <Router>
      <div>
        <h1>Angular / Angular-cli Issues</h1>
        <Routes>
          <Route path="/" element={
            <div className="card-container">
              {issues.map((issue, index) => (
                index === 4
                  ? <a href="https://www.wanted.co.kr/" key="ad-banner" target="_blank" rel="noopener noreferrer">
                      <img src="./cat_ad.jpg" alt="Advertisement" className="card-ad" />
                    </a>
                  : <Link to={`/issues/${issue.number}`} key={issue.id} className="card">
                      <div className="card-details">
                        <h2>#{issue.number} <span>{issue.title}</span></h2>
                        <p><strong>작성자:</strong> {issue.user.login}, <strong>작성일:</strong> {formatDate(issue.created_at)}</p>
                      </div>
                      <div className="card-comments">
                        <p><strong>코멘트:</strong> {issue.comments}</p>
                      </div>
                    </Link>
              ))}
              <div ref={loader} />
            </div>
          } />
          <Route path="/issues/:number" element={<IssueDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
