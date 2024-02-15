import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './postList.css';

const PostList = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/posts');
        setPosts(response.data);
        // Initialize comments state with empty strings for each post
        const initialComments = {};
        response.data.forEach(post => {
          initialComments[post.postId] = '';
        });
        setComments(initialComments);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const onLikeButton = async (postId, userId) => {
    try {
      // Make request to update likes count in the database
      await axios.post('http://localhost:3001/posts/like', {
        postId: postId,
        userId: userId,
      });
  
      // Update likes count in the UI with the response from the server
      const response = await axios.get('http://localhost:3001/posts');
      const updatedPosts = response.data;
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error updating like count:', error);
      // Handle error gracefully, e.g., display a message to the user
    }
  };
  
  

  const onSubmitComment = async (postId, userId, comment) => {
    try {
      await axios.post('http://localhost:3001/posts/comment', {
        postId: postId,
        userId: userId,
        comment: comment,
      });
      // Refresh posts after adding comment
      const response = await axios.get('http://localhost:3001/posts');
      setPosts(response.data);
      // Clear new comment input
      setComments({ ...comments, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentChange = (postId, comment) => {
    setComments({ ...comments, [postId]: comment });
  };

  return (
    <>
      <h1>POSTS</h1>
      {posts.map(post => (
        <div key={post.postId} className='main-container'>
          <div className='profile-container'>
            <img src={post.userProfileUrl} alt="Profile" className='profile-image' />
            <span>{post.userName}</span>
          </div>

          <div className='post-container'>
            <p>{post.caption}</p>
            <img src={post.imageUrl} alt="Post" className='post-image' />
          </div>

          <div className='like-container'>
            <button className='like-button' onClick={() => onLikeButton(post.postId, post.userId)}>
              <img src='https://res.cloudinary.com/ddgnliekv/image/upload/v1707895146/ezhu58n8uzcxccvvjgpd.png' className='like-button' />
            </button>
            <p>{post.likesCount}</p> {/* Display updated likes count */}
          </div>

          {/* Comment section */}
          <div>
            <input
              type="text"
              value={comments[post.postId]}
              onChange={e => handleCommentChange(post.postId, e.target.value)}
              placeholder="Add a comment..."
            />
            <button onClick={() => onSubmitComment(post.postId, post.userId, comments[post.postId])}>Submit</button>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostList;
