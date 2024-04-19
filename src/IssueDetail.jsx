// IssueDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { marked } from 'marked'; // Markdown 파서
import DOMPurify from 'dompurify'; // HTML 살균

const IssueDetail = () => {
  const { number } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get(`https://api.github.com/repos/angular/angular-cli/issues/${number}`);
        setIssue(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchIssue();
  }, [number]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading issue: {error.message}</p>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('ko-KR');
    return formattedDate;
  };

  const createMarkup = (markdown) => {
    const rawMarkup = marked(markdown);
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
  };

  return (
    <div>
      {issue && (
        <>
          <div className="card">
            <div className="profile-image">
              <img src={issue.user.avatar_url} alt={`${issue.user.login}'s avatar`} style={{ width: 70, height: 70, borderRadius: '50%' }} />
            </div>
            <div className="card-details">
              <h2>#{issue.number} {issue.title}</h2>
              <p><strong>작성자:</strong> {issue.user.login}, <strong>작성일:</strong> {formatDate(issue.created_at)}</p>
            </div>
            <div className="card-comments">
              <p><strong>코멘트:</strong> {issue.comments}</p>
            </div>
          </div>
          <div className="issue-body" dangerouslySetInnerHTML={createMarkup(issue.body)} />
        </>
      )}
    </div>
  );
};

export default IssueDetail;
