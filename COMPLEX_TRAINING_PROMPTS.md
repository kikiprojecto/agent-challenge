# 🎓 COMPLEX DETAILED TRAINING PROMPTS

## 🎯 **CRITICAL FIX APPLIED**

**Problem:** AI was generating ASCENDING order when user requested "biggest to smallest" (DESCENDING)

**Solution:** Added explicit sorting direction detection and instructions at 3 levels:
1. ✅ Language-specific prompts (codeGenerator.ts)
2. ✅ LLM prompt enhancement (route.ts)
3. ✅ Fallback code generator (route.ts)

---

## 📚 **COMPREHENSIVE TRAINING PROMPTS FOR ALL SCENARIOS**

### **1. SORTING ALGORITHMS - DESCENDING ORDER**

#### **Basic Descending Sort:**
```
Create a function to sort numbers from biggest to smallest: 7 5 0 3 9 2 4 8 5 4
```

**Expected Output (Python):**
```python
from typing import List

def sort_numbers(numbers: List[int]) -> List[int]:
    """
    Sort a list of integers in descending order.
    
    Args:
        numbers: List of integers to sort
        
    Returns:
        Sorted list in descending order (largest first)
        
    Example:
        >>> sort_numbers([7, 5, 0, 3, 9, 2, 4, 8, 5, 4])
        [9, 8, 7, 5, 5, 4, 4, 3, 2, 0]
    """
    if not isinstance(numbers, list):
        raise TypeError('Input must be a list')
    
    if not all(isinstance(n, int) for n in numbers):
        raise ValueError('All elements must be integers')
    
    return sorted(numbers, reverse=True)  # DESCENDING

if __name__ == '__main__':
    nums = [7, 5, 0, 3, 9, 2, 4, 8, 5, 4]
    result = sort_numbers(nums)
    print(f'Original: {nums}')
    print(f'Sorted (descending): {result}')
```

---

#### **Advanced Sorting with Custom Comparator:**
```
Create a sorting algorithm that sorts strings by length (longest first), then alphabetically if same length
```

**Expected Output (Python):**
```python
from typing import List

def sort_strings_custom(strings: List[str]) -> List[str]:
    """
    Sort strings by length (descending), then alphabetically (ascending).
    
    Args:
        strings: List of strings to sort
        
    Returns:
        Sorted list with longest strings first, alphabetical within same length
        
    Example:
        >>> sort_strings_custom(['cat', 'elephant', 'dog', 'butterfly', 'ant'])
        ['butterfly', 'elephant', 'ant', 'cat', 'dog']
    """
    if not isinstance(strings, list):
        raise TypeError('Input must be a list')
    
    if not all(isinstance(s, str) for s in strings):
        raise ValueError('All elements must be strings')
    
    # Sort by length (descending), then alphabetically (ascending)
    return sorted(strings, key=lambda x: (-len(x), x.lower()))

if __name__ == '__main__':
    words = ['cat', 'elephant', 'dog', 'butterfly', 'ant']
    result = sort_strings_custom(words)
    print(f'Sorted: {result}')
```

---

### **2. DATA STRUCTURES - COMPLEX IMPLEMENTATIONS**

#### **Binary Search Tree with Traversal:**
```
Implement a Binary Search Tree with insert, search, and in-order traversal methods. Include balance checking.
```

**Expected Output (Python):**
```python
from typing import Optional, List
from dataclasses import dataclass

@dataclass
class TreeNode:
    """Node in a binary search tree."""
    value: int
    left: Optional['TreeNode'] = None
    right: Optional['TreeNode'] = None

class BinarySearchTree:
    """
    Binary Search Tree implementation with insert, search, and traversal.
    
    Attributes:
        root: Root node of the tree
    """
    
    def __init__(self):
        """Initialize an empty BST."""
        self.root: Optional[TreeNode] = None
    
    def insert(self, value: int) -> None:
        """
        Insert a value into the BST.
        
        Args:
            value: Integer value to insert
            
        Example:
            >>> bst = BinarySearchTree()
            >>> bst.insert(5)
            >>> bst.insert(3)
            >>> bst.insert(7)
        """
        if self.root is None:
            self.root = TreeNode(value)
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node: TreeNode, value: int) -> None:
        """Helper method for recursive insertion."""
        if value < node.value:
            if node.left is None:
                node.left = TreeNode(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = TreeNode(value)
            else:
                self._insert_recursive(node.right, value)
    
    def search(self, value: int) -> bool:
        """
        Search for a value in the BST.
        
        Args:
            value: Value to search for
            
        Returns:
            True if value exists, False otherwise
            
        Example:
            >>> bst.search(5)
            True
            >>> bst.search(10)
            False
        """
        return self._search_recursive(self.root, value)
    
    def _search_recursive(self, node: Optional[TreeNode], value: int) -> bool:
        """Helper method for recursive search."""
        if node is None:
            return False
        if node.value == value:
            return True
        if value < node.value:
            return self._search_recursive(node.left, value)
        return self._search_recursive(node.right, value)
    
    def inorder_traversal(self) -> List[int]:
        """
        Perform in-order traversal (left-root-right).
        
        Returns:
            List of values in sorted order
            
        Example:
            >>> bst.inorder_traversal()
            [3, 5, 7]
        """
        result: List[int] = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node: Optional[TreeNode], result: List[int]) -> None:
        """Helper method for recursive in-order traversal."""
        if node is not None:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)
    
    def is_balanced(self) -> bool:
        """
        Check if the tree is balanced (height difference <= 1).
        
        Returns:
            True if balanced, False otherwise
        """
        def height(node: Optional[TreeNode]) -> int:
            if node is None:
                return 0
            return 1 + max(height(node.left), height(node.right))
        
        def check_balance(node: Optional[TreeNode]) -> bool:
            if node is None:
                return True
            left_height = height(node.left)
            right_height = height(node.right)
            if abs(left_height - right_height) > 1:
                return False
            return check_balance(node.left) and check_balance(node.right)
        
        return check_balance(self.root)

if __name__ == '__main__':
    # Example usage
    bst = BinarySearchTree()
    for value in [5, 3, 7, 1, 9, 4, 6]:
        bst.insert(value)
    
    print(f'In-order traversal: {bst.inorder_traversal()}')
    print(f'Search 4: {bst.search(4)}')
    print(f'Search 10: {bst.search(10)}')
    print(f'Is balanced: {bst.is_balanced()}')
```

---

### **3. ASYNC/CONCURRENT PROGRAMMING**

#### **Async API Client with Retry Logic:**
```
Create an async HTTP client that fetches data from multiple APIs concurrently with exponential backoff retry logic and timeout handling
```

**Expected Output (Python):**
```python
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import time

@dataclass
class APIResponse:
    """Response from an API call."""
    url: str
    data: Optional[Dict[str, Any]]
    status_code: int
    duration: float
    attempts: int

class AsyncAPIClient:
    """
    Async HTTP client with retry logic and concurrent requests.
    
    Features:
        - Concurrent API calls
        - Exponential backoff retry
        - Timeout handling
        - Error recovery
    """
    
    def __init__(self, max_retries: int = 3, timeout: int = 10):
        """
        Initialize the API client.
        
        Args:
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds
        """
        self.max_retries = max_retries
        self.timeout = aiohttp.ClientTimeout(total=timeout)
    
    async def fetch_with_retry(
        self, 
        session: aiohttp.ClientSession, 
        url: str
    ) -> APIResponse:
        """
        Fetch data from URL with exponential backoff retry.
        
        Args:
            session: aiohttp client session
            url: URL to fetch
            
        Returns:
            APIResponse with data and metadata
            
        Example:
            >>> async with aiohttp.ClientSession() as session:
            ...     response = await client.fetch_with_retry(session, url)
        """
        start_time = time.time()
        last_exception = None
        
        for attempt in range(1, self.max_retries + 1):
            try:
                async with session.get(url) as response:
                    data = await response.json() if response.status == 200 else None
                    duration = time.time() - start_time
                    
                    return APIResponse(
                        url=url,
                        data=data,
                        status_code=response.status,
                        duration=duration,
                        attempts=attempt
                    )
            
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                last_exception = e
                if attempt < self.max_retries:
                    # Exponential backoff: 1s, 2s, 4s
                    wait_time = 2 ** (attempt - 1)
                    print(f'Retry {attempt}/{self.max_retries} for {url} after {wait_time}s')
                    await asyncio.sleep(wait_time)
        
        # All retries failed
        duration = time.time() - start_time
        return APIResponse(
            url=url,
            data=None,
            status_code=0,
            duration=duration,
            attempts=self.max_retries
        )
    
    async def fetch_multiple(self, urls: List[str]) -> List[APIResponse]:
        """
        Fetch data from multiple URLs concurrently.
        
        Args:
            urls: List of URLs to fetch
            
        Returns:
            List of APIResponse objects
            
        Example:
            >>> urls = ['https://api1.com', 'https://api2.com']
            >>> responses = await client.fetch_multiple(urls)
        """
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            tasks = [self.fetch_with_retry(session, url) for url in urls]
            return await asyncio.gather(*tasks)

async def main():
    """Example usage of AsyncAPIClient."""
    client = AsyncAPIClient(max_retries=3, timeout=10)
    
    urls = [
        'https://jsonplaceholder.typicode.com/posts/1',
        'https://jsonplaceholder.typicode.com/posts/2',
        'https://jsonplaceholder.typicode.com/posts/3',
    ]
    
    print('Fetching data from multiple APIs...')
    responses = await client.fetch_multiple(urls)
    
    for response in responses:
        print(f'URL: {response.url}')
        print(f'Status: {response.status_code}')
        print(f'Duration: {response.duration:.2f}s')
        print(f'Attempts: {response.attempts}')
        print(f'Data: {response.data}')
        print('---')

if __name__ == '__main__':
    asyncio.run(main())
```

---

### **4. DESIGN PATTERNS - ADVANCED**

#### **Observer Pattern with Type Safety:**
```
Implement the Observer pattern for a stock price monitoring system with type-safe event handling and automatic cleanup
```

**Expected Output (TypeScript):**
```typescript
/**
 * Observer Pattern implementation for stock price monitoring
 */

interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

interface StockData {
  symbol: string;
  price: number;
  change: number;
  timestamp: Date;
}

/**
 * Stock price subject that notifies observers of price changes
 */
class StockPriceSubject implements Subject<StockData> {
  private observers: Set<Observer<StockData>> = new Set();
  private stockData: Map<string, StockData> = new Map();

  /**
   * Attach an observer to receive updates
   * @param observer - Observer to attach
   */
  attach(observer: Observer<StockData>): void {
    this.observers.add(observer);
    console.log(`Observer attached. Total: ${this.observers.size}`);
  }

  /**
   * Detach an observer from updates
   * @param observer - Observer to detach
   */
  detach(observer: Observer<StockData>): void {
    this.observers.delete(observer);
    console.log(`Observer detached. Total: ${this.observers.size}`);
  }

  /**
   * Notify all observers of stock data update
   * @param data - Stock data to broadcast
   */
  notify(data: StockData): void {
    this.observers.forEach(observer => {
      try {
        observer.update(data);
      } catch (error) {
        console.error(`Error notifying observer:`, error);
      }
    });
  }

  /**
   * Update stock price and notify observers
   * @param symbol - Stock symbol
   * @param price - New price
   */
  updatePrice(symbol: string, price: number): void {
    const previousData = this.stockData.get(symbol);
    const previousPrice = previousData?.price ?? price;
    const change = ((price - previousPrice) / previousPrice) * 100;

    const data: StockData = {
      symbol,
      price,
      change,
      timestamp: new Date()
    };

    this.stockData.set(symbol, data);
    this.notify(data);
  }
}

/**
 * Console logger observer
 */
class ConsoleObserver implements Observer<StockData> {
  update(data: StockData): void {
    const direction = data.change >= 0 ? '↑' : '↓';
    console.log(
      `[Console] ${data.symbol}: $${data.price.toFixed(2)} ` +
      `${direction} ${Math.abs(data.change).toFixed(2)}%`
    );
  }
}

/**
 * Alert observer for significant price changes
 */
class AlertObserver implements Observer<StockData> {
  constructor(private threshold: number = 5) {}

  update(data: StockData): void {
    if (Math.abs(data.change) >= this.threshold) {
      console.log(
        `[ALERT] ${data.symbol} changed by ${data.change.toFixed(2)}%!`
      );
    }
  }
}

/**
 * Database observer (simulated)
 */
class DatabaseObserver implements Observer<StockData> {
  update(data: StockData): void {
    // Simulate database write
    console.log(`[DB] Saving ${data.symbol} price: $${data.price.toFixed(2)}`);
  }
}

// Example usage
const stockSubject = new StockPriceSubject();

const consoleObserver = new ConsoleObserver();
const alertObserver = new AlertObserver(3);
const dbObserver = new DatabaseObserver();

stockSubject.attach(consoleObserver);
stockSubject.attach(alertObserver);
stockSubject.attach(dbObserver);

// Simulate price updates
stockSubject.updatePrice('AAPL', 150.00);
stockSubject.updatePrice('AAPL', 155.50);
stockSubject.updatePrice('GOOGL', 2800.00);
stockSubject.updatePrice('GOOGL', 2750.00);

// Detach an observer
stockSubject.detach(alertObserver);
stockSubject.updatePrice('AAPL', 160.00);

export { StockPriceSubject, ConsoleObserver, AlertObserver, DatabaseObserver };
```

---

### **5. BLOCKCHAIN/SMART CONTRACTS**

#### **Secure Token Contract with Access Control:**
```
Create a Solidity ERC20 token contract with minting, burning, pausable functionality, and role-based access control
```

**Expected Output (Solidity):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureToken
 * @dev ERC20 token with access control, pausable, and burn functionality
 * @notice Production-ready token with comprehensive security features
 */
contract SecureToken {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    // Balances and allowances
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Access control
    address public owner;
    mapping(address => bool) public minters;
    bool public paused = false;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "Not minter");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    /**
     * @dev Constructor sets token metadata and initial owner
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply (in whole tokens)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        minters[msg.sender] = true;
        
        _mint(msg.sender, _initialSupply * 10**decimals);
    }
    
    /**
     * @dev Transfer tokens to another address
     * @param _to Recipient address
     * @param _value Amount to transfer
     * @return success True if transfer succeeded
     */
    function transfer(address _to, uint256 _value) 
        public 
        whenNotPaused 
        returns (bool success) 
    {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev Approve spender to transfer tokens on behalf of owner
     * @param _spender Address authorized to spend
     * @param _value Amount authorized
     * @return success True if approval succeeded
     */
    function approve(address _spender, uint256 _value) 
        public 
        whenNotPaused 
        returns (bool success) 
    {
        require(_spender != address(0), "Invalid spender");
        
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another (requires approval)
     * @param _from Source address
     * @param _to Destination address
     * @param _value Amount to transfer
     * @return success True if transfer succeeded
     */
    function transferFrom(address _from, address _to, uint256 _value) 
        public 
        whenNotPaused 
        returns (bool success) 
    {
        require(_to != address(0), "Invalid address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev Mint new tokens (only minters)
     * @param _to Address to receive minted tokens
     * @param _value Amount to mint
     */
    function mint(address _to, uint256 _value) 
        public 
        onlyMinter 
        whenNotPaused 
    {
        require(_to != address(0), "Invalid address");
        
        _mint(_to, _value);
    }
    
    /**
     * @dev Internal mint function
     */
    function _mint(address _to, uint256 _value) internal {
        totalSupply += _value;
        balanceOf[_to] += _value;
        
        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param _value Amount to burn
     */
    function burn(uint256 _value) public whenNotPaused {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        
        emit Burn(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);
    }
    
    /**
     * @dev Pause all token transfers
     */
    function pause() public onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @dev Add minter role to address
     * @param _account Address to grant minter role
     */
    function addMinter(address _account) public onlyOwner {
        require(_account != address(0), "Invalid address");
        minters[_account] = true;
        emit MinterAdded(_account);
    }
    
    /**
     * @dev Remove minter role from address
     * @param _account Address to revoke minter role
     */
    function removeMinter(address _account) public onlyOwner {
        minters[_account] = false;
        emit MinterRemoved(_account);
    }
}
```

---

## 🎯 **KEY TRAINING PRINCIPLES**

### **1. Understand User Intent:**
```
✅ "biggest to smallest" → reverse=True, sort((a,b) => b-a)
✅ "smallest to biggest" → reverse=False, sort((a,b) => a-b)
✅ "descending" → largest first
✅ "ascending" → smallest first
✅ "high to low" → descending
✅ "low to high" → ascending
```

### **2. Always Include:**
```
✅ Type hints/annotations
✅ Comprehensive documentation
✅ Error handling
✅ Input validation
✅ Example usage
✅ Edge case handling
✅ Performance optimization
✅ Security considerations
```

### **3. Code Quality Standards:**
```
✅ NO TODO comments
✅ NO placeholders
✅ NO pseudo-code
✅ ONLY working implementations
✅ Production-ready code
✅ Best practices for language
✅ Optimized algorithms
✅ Clean, readable code
```

---

## 🚀 **TEST YOUR TRAINING**

Try these prompts to verify the AI understands:

1. **"Sort [9,3,7,1,5] from biggest to smallest"**
   - Expected: `[9, 7, 5, 3, 1]`

2. **"Create descending sort for 4 8 2 6 1"**
   - Expected: `[8, 6, 4, 2, 1]`

3. **"Implement bubble sort in ascending order"**
   - Expected: Smallest to largest

4. **"Build a priority queue (highest priority first)"**
   - Expected: Max heap implementation

5. **"Create a leaderboard sorted by score (highest first)"**
   - Expected: Descending order by score

---

**Server restarted with fixes! Test at http://localhost:3000** 🚀
