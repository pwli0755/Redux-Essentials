import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { PostAuthor } from "./PostAuthor";
import { TimeAgo } from "./TimeAgo";
import { ReactionButtons } from "./ReactionButton";
import { selectPostById } from "./postsSlice";
import { useGetPostQuery } from "../api/apiSlice";
import { Spinner } from "../../components/Spinner";
import { el } from "date-fns/locale";
import { isElement, isError } from "lodash";

export const SinglePostPage = ({ match }) => {
  const { postId } = match.params;

  const { data: post, isFetching, isSuccess, isError,
    error } = useGetPostQuery(postId)

  let content

  if (isFetching) {
    content = <Spinner text="Loading" />
  } else if (isSuccess) {
    content = (
      <section>
        <article className="post">
          <h2> {post.title}</h2>
          <p className="post-content">{post.content}</p>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
          <ReactionButtons post={post} />
          <Link to={`/editPost/${post.id}`} className="button">
            Edit Post
          </Link>
        </article>
      </section>
    )
  } else if (isError) {
    content = <div> {"error"+ error}</div>
  }
  return <section>{content}</section>

};
