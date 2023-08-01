import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { tr } from "faker/lib/locales"

export const apiSlice = createApi({
    reducerPath: 'api',
    keepUnusedDataFor: 10,
    baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
    tagTypes: ['Posts'],
    endpoints: builder => ({
        getPosts: builder.query({
            query: () => '/posts',
            providesTags: (result = [], error, arg) => [
                'Posts',
                ...result.map(({ id }) => ({ type: 'Posts', id }))
            ]
        }),
        getPost: builder.query({
            query: postId => `/posts/${postId}`,
            providesTags: (result, error, arg) => [{ type: 'Posts', id: arg }]
        }),
        addNewPost: builder.mutation({
            query: initialPost => ({
                url: '/posts',
                method: 'POST',
                body: initialPost
            }),
            invalidatesTags: ['Posts']
        }),
        editPost: builder.mutation({
            query: post => ({
                url: `/posts/${post.id}`,
                method: 'PATCH',
                body: post
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts', id: arg.id }]
        }),
        addReaction: builder.mutation({
            query: ({ postId, reaction }) => ({
                url: `posts/${postId}/reactions`,
                method: 'POST',
                // In a real app, we'd probably need to base this on user ID somehow
                // so that a user can't do the same reaction more than once
                body: { reaction }
            }),
            async onQueryStarted({ postId, reaction }, { dispatch, queryFulfilled }) {
                // `updateQueryData` requires the endpoint name and cache key arguments,
                // so it knows which piece of cache state to update
                const patchResult = dispatch(
                    apiSlice.util.updateQueryData('getPosts', undefined, draft => {
                        // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
                        const post = draft.find(post => post.id === postId)
                        if (post) {
                            post.reactions[reaction]++
                        }
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            }

        }),
    })
})

export const {
    useGetPostsQuery,
    useGetPostQuery,
    useAddNewPostMutation,
    useEditPostMutation,
    useAddReactionMutation,
} = apiSlice

console.log(apiSlice)