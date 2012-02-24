@@blocks = Hash.new

def DECL block, &content
    @@blocks[block] = content
end

def DO block, *args, &content
    unless block_given?
        capture_haml do
            block.call
        end
    else
        args.unshift content
        @@blocks[block].call(*args)
    end
end
